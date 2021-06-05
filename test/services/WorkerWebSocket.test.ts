import WebSocket from 'ws';
import Item from '../../src/model/Item';
import DatesUtils from '../../src/udf/DatesUtil'

const { WORKER_PORT = 5000 } = process.env;

describe('WorkerWebSocket', () => {

    let ws;
    let item;

    beforeEach(() => {
        ws = new WebSocket(`ws://127.0.0.1:${WORKER_PORT}`);
        item = new Item('TEST', 'USDT', 0, DatesUtils.cleanTime(new Date().getTime()));
    });

    it('correct format',(done) => {

        ws.on('message', (msg) => {

            const itemResponse = JSON.parse(msg);

            expect(item.category).toEqual(itemResponse.category);

            expect(item.tags).toEqual(itemResponse.tags);

            expect(item.source).toEqual(itemResponse.source);

            expect(item.timestamp).toBeLessThan(itemResponse.timestamp);

            expect(item.location).toEqual(itemResponse.location);

            expect(0).toBeLessThan(Number.parseFloat(itemResponse.value));

            ws.close();
            
        }).on('close', () => done());
    });
});