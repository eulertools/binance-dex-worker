import express, { Express } from 'express';
import healthcheck from 'express-healthcheck';
import log from '../log';
import PKG from '../../package.json';
import BinanceClient from './BinanceClient';
import UDFUtil from '../udf/UDFUtil';
import validator,{ QueryError } from './ValidatorInputParam';

const { version } = PKG;

const { HTTP_PORT = 3000} = process.env;

class WorkerApp {

    private app:Express;

    private client:BinanceClient;

    constructor(client:BinanceClient) {

        this.client = client;

        this.app = express();

        this.app.use(express.json());
    }

    public listen() {

        this.defineApp();

        this.app.listen(HTTP_PORT, () => {

            log.info(`Service HTTP:${HTTP_PORT} listening...`)
        });
    }

    private defineApp() {

        this.app.get('/version', async (req,res) => {

            res.json(version);
        });

        this.app.use('/healthcheck', healthcheck());

        this.app.get('/pairs', (req,res, next) => {

            this.handlePromise(res,next,this.pairsInfo());
        });

        this.app.get('/currentPrice',[validator.search],(req,res, next) => {

            this.handlePromise(res,next,this.currentPrice(req.query.search));
        });

        this.app.get('/history', [validator.pair,validator.from,validator.to], async (req,res, next) => {

            this.handlePromise(res,next,this.history(req));
        });

        this.app.use((err, req, res, next) => {

            if(err) {

                if (err.status) {

                    return res.status(err.status).send({ message: err.message });
                } 

                log.error(err);

                return res.status(500).send({ message: 'Internal Error' });
            }

           next();
        });
    }

    private handlePromise(res, next, promise) {

        promise.then(result => {

            res.send(result);

        }).catch(err => { 

            next(err);
        })
    }

    public async pairsInfo():Promise<string> {

        const pairs = await this.client.pairs;

        const json = JSON.stringify({ pairs: Array.from(pairs.keys()) });

        return json;
    }

    public async currentPrice(search:string):Promise<string> {

        const pairs = await this.client.pairs;

        const pairsSearch = []

        for(const key of search.split(',')) {

            const pair = pairs.get(key);

            if(pair) pairsSearch.push(pairs.get(key));
            else throw QueryError.notFound(key);
        }

        return JSON.stringify( { result: await this.client.search(pairsSearch) } );
    }

    public async history(req:any):Promise<string> {

        const { pair, from } = req.query;

        let { to } = req.query;

        if(from > to) throw QueryError.other(`from(${from}) is greater than to(${to})`);

        const currentTime = new Date().getTime() / 1000;

        if(to > currentTime) to = currentTime;

        const pairs = await this.client.pairs;

        const pairObj = pairs.get(pair);

        if(!pairObj) {

            throw QueryError.notFound(pair);
        }

        return Promise.resolve(UDFUtil.get(this.client, pairObj, from, to));
    }
}

export default WorkerApp;