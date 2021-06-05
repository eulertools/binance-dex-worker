import request from 'request';
import PKG from '../../package.json';
import Item from '../../src/model/Item'
import DatesUtils from '../../src/udf/DatesUtil'

const { version } = PKG;
const { HTTP_PORT = 3000} = process.env;

const target = async (path, options):any => {

    const promise = new Promise((resolve, reject) => {

        request(`http://127.0.0.1:${HTTP_PORT}${path}`, options, (err, res, body) => {

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

describe('WorkerApp', () => {

    it('get version', async() => {

        const response = await target('/version');

        expect(response).toEqual(version);
    });


    it('get pairs', async() => {

        const response = await target('/pairs');

        const NUMBER_PAIRS = 1428;

        expect(NUMBER_PAIRS).toEqual(response.pairs.length);
    });

    describe('currentPrice', () => {

        let item;
        let secondItem;
        let badItem;

        beforeEach(() => {

            item = new Item('BNB', 'USDT', 0, new Date().getTime());
            secondItem = new Item('BNB', 'USDC', 0, new Date().getTime());
            badItem = new Item('TEST', 'USDT', 0, new Date().getTime());
        });

        it('get price of one item', async() => {

            const response = await target(`/currentPrice?search=${item.title}${item.magnitude}`);

            const itemResponse = response.result[0];

            expect(item.title).toEqual(itemResponse.title);

            expect(item.magnitude).toEqual(itemResponse.magnitude);

            expect(item.tags).toEqual(itemResponse.tags);

            expect(item.value).toBeLessThan(Number.parseInt(itemResponse.value));

            expect(item.source).toEqual(itemResponse.source);

            expect(item.timestamp).toBeLessThan(itemResponse.timestamp);

            expect(item.location).toEqual(itemResponse.location);
        });

        it('get price of more items', async() => {

            const response = await target(`/currentPrice?search=${item.title}${item.magnitude},${secondItem.title}${secondItem.magnitude}`);

            const items = [ item, secondItem ];

            const itemsResponse = response.result;

            let i = 0;

            for(const itemResponse of itemsResponse) {

                expect(items[i].title).toEqual(itemResponse.title);

                expect(items[i].magnitude).toEqual(itemResponse.magnitude);

                expect(items[i].tags).toEqual(itemResponse.tags);

                expect(items[i].value).toBeLessThan(Number.parseInt(itemResponse.value));

                expect(items[i].source).toEqual(itemResponse.source);

                expect(items[i].timestamp).toBeLessThan(itemResponse.timestamp);

                expect(items[i].location).toEqual(itemResponse.location);

                i++;
            }
        });

        it('bad item of input', async() => {

            const response = await target(`/currentPrice?search=${badItem.title}${badItem.magnitude}`);

            expect(`Not found '${badItem.title}${badItem.magnitude}'`).toEqual(response.message);
        });

        it('empty item of input', async() => {

            const response = await target(`/currentPrice`);

            expect(`Missing mandatory parameter 'search'`).toEqual(response.message);
        });
    });

    describe('history', () => {

        let pair:string;
        let badPair:string;
        let from:number;
        let to:number;
        let now:Date;

        beforeEach(() => {

            pair = 'BNBUSDT';
            badPair = 'TESTUSDT';
            now  = new Date();
        });

        it('history of BNB/USDT last day', async() => {

            from = DatesUtils.cleanTime(now.setDate(now.getDate() - 2) / 1000);

            to = DatesUtils.lastMinuteDay(from);

            const REGISTER_FOR_DAY = 1940;

            const response = await target(`/history?pair=${pair}&from=${from}&to=${to}`);

            expect(response.s).toEqual('ok');

            expect(response.t.length).toEqual(REGISTER_FOR_DAY);

            expect(response.c.length).toEqual(REGISTER_FOR_DAY);

            expect(response.o.length).toEqual(REGISTER_FOR_DAY);

            expect(response.h.length).toEqual(REGISTER_FOR_DAY);

            expect(response.l.length).toEqual(REGISTER_FOR_DAY);

            expect(response.v.length).toEqual(REGISTER_FOR_DAY);

            expect(response.t[0]).toEqual(from);

            expect(response.t[REGISTER_FOR_DAY - 1]).toEqual(to);
        });

        it('history of BNB/USDT last month', async() => {

            to = DatesUtils.lastMinuteDay((now.setDate(now.getDate() - 2) / 1000));

            from = DatesUtils.cleanTime(now.setDate(now.getDate() - 30) / 1000);

            const REGISTER_FOR_MONTH = 56500;

            const response = await target(`/history?pair=${pair}&from=${from}&to=${to}`);

            expect(response.s).toEqual('ok');

            expect(response.t.length).toBeGreaterThan(REGISTER_FOR_MONTH);

            expect(response.c.length).toBeGreaterThan(REGISTER_FOR_MONTH);

            expect(response.o.length).toBeGreaterThan(REGISTER_FOR_MONTH);

            expect(response.h.length).toBeGreaterThan(REGISTER_FOR_MONTH);

            expect(response.l.length).toBeGreaterThan(REGISTER_FOR_MONTH);

            expect(response.v.length).toBeGreaterThan(REGISTER_FOR_MONTH);

            expect(response.t[0]).toEqual(from);

            expect(response.t[response.t.length - 1]).toEqual(to);
        });

        it('bad pair of input', async() => {

            from = now.getTime();

            to = now.getTime();

            const response = await target(`/history?pair=${badPair}&from=${from}&to=${to}`);

            expect(response.message).toEqual(`Not found '${badPair}'`);
        });

        it('missing pair of input', async() => {

            from = now.getTime();

            to = now.getTime();

            const response = await target(`/history?from=${from}&to=${to}`);

            expect(response.message).toEqual(`Missing mandatory parameter 'pair'`);
        });

        it('missing from of input', async() => {

            to = now.getTime();

            const response = await target(`/history?pair=${badPair}&to=${to}`);

            expect(response.message).toEqual(`Missing mandatory parameter 'from'`);
        });

        it('missing to of input', async() => {

            from = now.getTime();

            const response = await target(`/history?pair=${badPair}&from=${from}`);

            expect(response.message).toEqual(`Missing mandatory parameter 'to'`);
        });

        it('from greater than to', async() => {

            from = now.getTime();

            to = from - 1;

            const response = await target(`/history?pair=${badPair}&from=${from}&to=${to}`);

            expect(response.message).toEqual(`from(${from}) is greater than to(${to})`);
        });
    });
}); 