import Binance from 'node-binance-api';
import request from 'request';
import log from '../log';
import Pair from '../model/Pair';
import Item from '../model/Item';
import ListenerWebSocket from './ListenerWebSocket';

const { APIKEY, APISECRET } = process.env;

const MAX_RECORDS = 500;

class BinanceClient {

    private client:any;

    public pairs:Map<String,Pair>;

    public constructor() {

        this.client = new Binance();

        this.client.options({ APIKEY, APISECRET });

        this.pairs = this.loadPairs();
    }

    private loadPairs():Map<String,Pair> {

        const promise = this.client.exchangeInfo().catch(err => {

            log.error(err);

            setTimeout(() => { this.loadPairs() }, 1000)
        })

        return promise.then(info => {

            const map = new Map();

            for (const symbol of info.symbols) { 

                map.set(symbol.symbol, new Pair(symbol.symbol,symbol.baseAsset,symbol.quoteAsset)); 
            }

            return map;
        });
    }

    public search(pairs:Pair[]):Item[] {

        const promise = this.client.prices().catch(err => {

            log.error(err);

            setTimeout(() => { this.search(pairs) }, 1000)
        })

        return promise.then(info => {

            const search = [];

            for(const pair of pairs) {

                search.push(new Item(pair.symbol,pair.magnitude,info[pair.name],new Date().getTime())); 
            }
            return search;
        });
    }

    public async history(pair:Pair, from:number, to:number) {

        let totalRecords = []

        from *= 1000;
        to *= 1000;

        let records = await this.klines(pair.name, '1m', from, to, MAX_RECORDS);

        totalRecords = totalRecords.concat(records);

        while (records.length >= MAX_RECORDS) {

            records = await this.klines(pair.name, '1m', from, to, MAX_RECORDS);

            totalRecords = totalRecords.concat(records);

            if (records.length >= MAX_RECORDS) {

                from = records[records.length - 1][0] + 1
            }
        }

        return totalRecords;
    }

    private klines(symbol, interval, startTime, endTime, limit):any {
        
        return this.target('/api/v1/klines', { qs: { symbol, interval, startTime, endTime, limit } });
    }
    
    private target(path, options):any {

        const promise = new Promise((resolve, reject) => {

            request(`https://api.binance.com${path}`, options, (err, res, body) => {

                if (!err && body) {

                    try {

                        const json = JSON.parse(body);

                        if (!(json.code && json.msg)) {

                            return resolve(json);
                        }

                        err = new Error(json.msg);

                        err.code = json.code;
                        
                    } catch (ex) { return reject(ex) };

                } else if (!body) { err = new Error('No body') }; 

                return reject(err);
            });
        });

        return promise;
    }

    public listenWebsocket(listener:ListenerWebSocket) {

        this.client.websockets.prevDay(false, async (err, event) => {

            if (!err) { 

                await listener.sync(event);

            } else { 

                log.error(`API error: ${err}`)

                throw err;
            }
        });
    }
}

export default BinanceClient;