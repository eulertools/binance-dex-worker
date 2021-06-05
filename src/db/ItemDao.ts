import { v4 as uuid } from 'uuid';
import { Pool } from 'pg';
import Item from '../model/Item'
import log from '../log';

const INSET_ITEM =
    'INSERT INTO ITEM(I_OID, I_TITLE, I_MAGNITUDE, I_TAGS, I_VALUE, I_SOURCE, I_TIMESTAMP, I_LOCATION) VALUES($1, $2, $3, $4, $5, $6, $7, $8)';

export default {

    persist: (pool:Pool,item:Item) => {

        const { title, magnitude, tags, value, source ,timestamp, location } = item;

        pool.query(INSET_ITEM,[uuid(), title, magnitude, tags, value, source, new Date(timestamp), location], (err) => {

            if (err) {  
                
                log.error(err);

                throw err;
            }
        });
    }
}