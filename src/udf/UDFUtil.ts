import log from '../log';
import Pair from "../model/Pair";
import BinanceClient from "../service/BinanceClient";
import DatesUtil from "./DatesUtil";
import UDFDao from "./UDFDao";

const TIMESTAMP = 0;
const CLOSING_PRICE = 4;
const OPENING_PRICE = 1;
const HIGH_PRICE = 2;
const LOW_PRICE = 3;
const VOLUME = 5;
const CLEAN_MILIS = 1000;
const NO_VALUE = -1;

export default {

    toJSON: (udfVector:any[]):string =>  {

        if(udfVector.length > 0) {

            return JSON.stringify({
                s: 'ok',
                t: udfVector.map(b => Math.floor(b[TIMESTAMP] / CLEAN_MILIS)),
                c: udfVector.map(b => parseFloat(b[CLOSING_PRICE])),
                o: udfVector.map(b => parseFloat(b[OPENING_PRICE])),
                h: udfVector.map(b => parseFloat(b[HIGH_PRICE])),
                l: udfVector.map(b => parseFloat(b[LOW_PRICE])),
                v: udfVector.map(b => parseFloat(b[VOLUME]))
            });
        }
    
        return JSON.stringify({ s: 'no_data' });
    },

    trimEnds : (from:number,to:number,udfVector:any[]):any[] =>  {

        const ends = { from: NO_VALUE , to: NO_VALUE}

        let i:number = 0;

        for(; i < udfVector.length && (ends.from === NO_VALUE || ends.to === NO_VALUE); i++) {

            const timestamp = udfVector[i][0] / 1000;

            if(ends.from === NO_VALUE && (timestamp >= from)) ends.from = i;
        
            if(ends.to === NO_VALUE && (timestamp >= to)) ends.to = i + 1;
        }

        if(ends.to === NO_VALUE) ends.to = i;

        return udfVector.slice(ends.from,ends.to);
    },

    async get(client:BinanceClient, pair:Pair, from:number, to:number) {

        let totalRecords = [];

        const days:number[] = DatesUtil.getDays(from,to);

        for(const day of days) {

            let records = JSON.parse(await UDFDao.get(pair.name, day));
    
            if(!records) {
    
                records = await client.history(pair, day, DatesUtil.lastMinuteDay(day));
    
                await UDFDao.set(pair.name, day, JSON.stringify(records));

                log.debug(`Records imported on cache with key ${pair.name}_${day}: ${records.length}`);

            } else if (day === days[days.length -1]) {

                const lastTimestamp = this.getLastTimestamp(records);

                if(to > lastTimestamp) {

                    records = await client.history(pair, day, DatesUtil.lastMinuteDay(day));

                    await UDFDao.set(pair.name, day, JSON.stringify(records));

                    log.debug(`Records regenerate imported on cache with key ${pair.name}_${day}: ${records.length}`);
                }
            }

            totalRecords = totalRecords.concat(records);
        }

        totalRecords = this.trimEnds(from,to,totalRecords);

        log.debug(`Records returned with next parameter ${pair.name} ${from} ${to}: ${totalRecords.length}`);

        return this.toJSON(totalRecords);
    },

    getLastTimestamp(records:any[]) {

        return records[records.length - 1][TIMESTAMP] / 1000;
    }
}