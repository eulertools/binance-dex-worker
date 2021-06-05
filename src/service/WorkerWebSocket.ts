import WebSocket from 'ws';
import { Pool } from 'pg';
import Item from '../model/Item';
import ItemDao from '../db/ItemDao';
import log from '../log';
import BinanceClient from './BinanceClient';
import ListenerWebSocket from './ListenerWebSocket';

const { WORKER_PORT = 5000 } = process.env;

class WorkerWebSocket implements ListenerWebSocket {

    private sockets:WebSocket[];

    private pool:Pool;

    private client:BinanceClient;

    constructor(client:BinanceClient) {

        this.sockets = [];

        this.client = client;

        this.pool = new Pool();
    }

    public listen() {

        const server = new WebSocket.Server({ port: WORKER_PORT });

        server.on('connection', (socket) => this.onConnection(socket));

        this.client.listenWebsocket(this);

        log.info(`Service ws:${WORKER_PORT} listening...`);
    }

    public async sync(event) {

        const pairs = await this.client.pairs;

        const pair = pairs.get(event.symbol);

        const item = new Item(pair.symbol,pair.magnitude,event.bestAsk,event.eventTime);

        await ItemDao.persist(this.pool,item);

        this.sockets.forEach((socket) => socket.send(JSON.stringify(item)));
    }

    public onConnection(socket) {

        this.sockets.push(socket);

        log.debug('[ws:socket] connect.');
    }
}

export default WorkerWebSocket;