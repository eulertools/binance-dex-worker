import { createLogger, transports }  from 'winston';
import ecsFormat from '@elastic/ecs-winston-format';

const log = createLogger({
    format: ecsFormat(),
    transports: [new transports.Console()]
});

export default log;