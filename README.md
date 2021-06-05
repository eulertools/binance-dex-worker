# BINANCE WORKER

The project has two parts: websockets server and the rest api. Can test it by running `docker-compose up`

## Websockets Server
The service is purposed to be a proxy of Binance's websocket and in turn save the record that is returned in the database. The server bind on port 5000 by default.

The database chosen to store the information is Postgres.

The JSON format returned by the socket is:
```json
{"title":"EULER","magnitude":"USDT","category":"currency","tags":["crypto","pair"],"value":"200.00000000","source":"binance.com","timestamp":1620069512348,"location":"global"}
```

The DDL of the database is as follows:
```sql
CREATE TABLE PUBLIC.ITEM (
	I_OID VARCHAR NOT NULL PRIMARY KEY,
	I_TITLE VARCHAR,
	I_MAGNITUDE VARCHAR,
	I_TAGS VARCHAR ARRAY,
	I_VALUE FLOAT8,
	I_SOURCE VARCHAR,
	I_TIMESTAMP TIMESTAMP,
	I_LOCATION VARCHAR
);
```
## REST API
It is a proxy of Binance's REST API. The server bind on port 3000 by default.
There is a token history service that uses Redis to cache queries per day and pair. The number of records stored is 1940 per day.

### Version

##### Request

`GET /version`

    curl -i -H 'Accept: application/json' 'http://localhost:3000/version'

### Response

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 7
    ETag: W/"7-Cirs2uSpdAjnR3V3ReVBOKiq2OQ"
    Date: Mon, 03 May 2021 19:40:47 GMT
    Connection: keep-alive
    
    "1.0.0"
### Pairs    
##### Request

`GET /pairs`

    curl -i -H 'Accept: application/json' 'http://localhost:3000/pairs'

### Response

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: text/html; charset=utf-8
    Content-Length: 14289
    ETag: W/"37d1-A/MNOdeZOXBhvf0lia6tX5vhAic"
    Date: Mon, 03 May 2021 19:42:22 GMT
    Connection: keep-alive

    {"pairs":["ETHBTC","LTCBTC","BNBBTC","NEOBTC","QTUMETH","EOSETH","SNTETH","BNTETH","BCCBTC","GASBTC","BNBETH","BTCUSDT","ETHUSDT","HSRBTC",...]}
    
### Current price   
##### Request

`GET /currentPrice`

    curl -i -H 'Accept: application/json' 'http://localhost:3000/currentPrice?search=BNBUSDT'

### Response

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: text/html; charset=utf-8
    Content-Length: 186
    ETag: W/"ba-g5K9+x46FbKNePH0S4Xw6LBs8qQ"
    Date: Mon, 03 May 2021 19:49:25 GMT
    Connection: keep-alive

    {"result":[{"title":"BNB","magnitude":"USDT","category":"currency","tags":["crypto","pair"],"value":"675.24000000","source":"binance.com","timestamp":1620071365487,"location":"global"}]}
    
### History 
##### Request

`GET /history`

    curl -i -H 'Accept: application/json' 'http://localhost:3000/history?pair=BNBUSDT&from=1620071000&to=1620071311'

### Response

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: text/html; charset=utf-8
    Content-Length: 329
    ETag: W/"149-ZowKyfrhc4TwzvoAFpXs1u3K0Ac"
    Date: Mon, 03 May 2021 19:53:11 GMT
    Connection: keep-alive

    {"s":"ok","t":[1620071040,1620071100,1620071160,1620071220,1620071280,1620071340],"c":[674.81,673.56,674.31,674.86,674.86,675.66],"o":[674.29,674.89,673.52,674.31,674.86,674.86],"h":[675.82,675,674.31,675.24,675,675.76],"l":[674.18,673,673.18,674.31,673.99,674.65],"v":[1446.9838,2068.8611,755.6776,832.6707,1071.2536,1954.6223]}
