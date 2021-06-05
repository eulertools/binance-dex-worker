import { Pool } from 'pg';
import RedisClient from '../cache/RedisClient';
import InitDB from '../db/InitDB';

const envVariables = ['REDIS_URL','PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE']

export default {

    check: async() =>  {

        for(const variable of envVariables) {

            if(!process.env[variable]) throw Error(`Environment varible don't definide: ${variable}`)
        }

        await RedisClient.getAsync('test');

        const pool = new Pool();

        await pool.query('SELECT NOW()');

        InitDB.init(pool);

        await pool.end();
    }
}