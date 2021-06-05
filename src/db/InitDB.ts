import { Pool } from 'pg';
import fs from'fs';
import path from 'path'
import log from '../log';

const { PGSCHEMA = 'public'} = process.env;

export default {

    init: (pool:Pool) => {

        let sql = fs.readFileSync(path.resolve(__dirname,'../../script/db/schema.sql')).toString();

        sql = sql.replace("#SCHEMA",PGSCHEMA);

        pool.query(sql, (err) => {

            if (err) {  log.error(err.stack) }
        });
    }
}