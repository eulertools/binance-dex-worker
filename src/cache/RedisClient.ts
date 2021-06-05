import redis from 'redis';
import { promisify } from 'util';
import log from '../log'

const RedisClient = redis.createClient(process.env.REDIS_URL);

RedisClient.on('error', (err) => {

    log.error(err);

    throw err;
});

module.exports = {
    ...RedisClient,
    getAsync: promisify(RedisClient.get).bind(RedisClient),
    setAsync: promisify(RedisClient.set).bind(RedisClient),
    keysAsync: promisify(RedisClient.keys).bind(RedisClient)
};

export default RedisClient;