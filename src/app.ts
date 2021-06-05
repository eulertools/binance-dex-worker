import PKG from '../package.json';
import WorkerApp from './service/WorkerApp';
import log from './log';
import WebSocketWorker from './service/WorkerWebSocket';
import CheckInit from './service/CheckInit';
import BinanceClient from './service/BinanceClient';

const { name, version } = PKG;

log.info(`${name} v${version}`);

const init = async() => {

    await CheckInit.check().then(() => {

        const client = new BinanceClient();

        const worker = new WebSocketWorker(client);

        worker.listen();

        const app = new WorkerApp(client);

        app.listen();

    }).catch((err) => {

        log.error(err);
        
        process.exit(-1);
    });
}

init(); 