import RedisClient from '../cache/RedisClient';

const key = (pair:string, day:number) => `${pair}_${day}`;

export default {

    get: async (pair:string, day:number):Promise<string> => RedisClient.getAsync(key(pair,day)),

    set: async (pair:string, day:number, udf:string):Promise<any> => RedisClient.setAsync(key(pair,day),udf)
}