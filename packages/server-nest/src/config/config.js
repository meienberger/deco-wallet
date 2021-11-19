"use strict";
exports.__esModule = true;
var dotenv = require("dotenv");
var constants_1 = require("./constants");
dotenv.config();
// if (process.env.NODE_ENV === 'production') {
//   dotenv.config();
// } else {
//   dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
// }
var env = process.env;
var _a = env.NODE_ENV, NODE_ENV = _a === void 0 ? 'development' : _a, _b = env.APP_PORT, APP_PORT = _b === void 0 ? 3000 : _b, _c = env.LOGS_FOLDER, LOGS_FOLDER = _c === void 0 ? 'logs' : _c, _d = env.LOGS_APP, LOGS_APP = _d === void 0 ? 'app.log' : _d, _e = env.LOGS_ERROR, LOGS_ERROR = _e === void 0 ? 'error.log' : _e, _f = env.POSTGRES_IP, POSTGRES_IP = _f === void 0 ? '10.21.21.4' : _f, _g = env.POSTGRES_PORT, POSTGRES_PORT = _g === void 0 ? 5432 : _g, _h = env.POSTGRES_DBNAME, POSTGRES_DBNAME = _h === void 0 ? '' : _h, _j = env.POSTGRES_USERNAME, POSTGRES_USERNAME = _j === void 0 ? '' : _j, _k = env.POSTGRES_PASSWORD, POSTGRES_PASSWORD = _k === void 0 ? '' : _k, _l = env.REDIS_IP, REDIS_IP = _l === void 0 ? '' : _l, _m = env.REDIS_PORT, REDIS_PORT = _m === void 0 ? 6379 : _m, _o = env.COOKIE_SECRET, COOKIE_SECRET = _o === void 0 ? '' : _o, _p = env.HASH_SECRET, HASH_SECRET = _p === void 0 ? '' : _p, _q = env.BITCOIND_LOGIN, BITCOIND_LOGIN = _q === void 0 ? '' : _q, _r = env.BITCOIND_PASSWORD, BITCOIND_PASSWORD = _r === void 0 ? '' : _r, _s = env.BITCOIND_IP, BITCOIND_IP = _s === void 0 ? '' : _s, _t = env.BITCOIND_PORT, BITCOIND_PORT = _t === void 0 ? '' : _t, _u = env.APP_LND_IP, APP_LND_IP = _u === void 0 ? '' : _u, _v = env.APP_LND_PORT, APP_LND_PORT = _v === void 0 ? '' : _v, _w = env.TLS_CERT, TLS_CERT = _w === void 0 ? '' : _w, _x = env.ADMIN_MACAROON, ADMIN_MACAROON = _x === void 0 ? '' : _x;
var config = {
    NODE_ENV: NODE_ENV,
    COOKIE_SECRET: COOKIE_SECRET,
    HASH_SECRET: HASH_SECRET,
    APP_PORT: Number(APP_PORT),
    forceStart: true,
    logs: {
        LOGS_FOLDER: LOGS_FOLDER,
        LOGS_APP: LOGS_APP,
        LOGS_ERROR: LOGS_ERROR
    },
    typeorm: {
        type: 'postgres',
        host: POSTGRES_IP,
        database: POSTGRES_DBNAME,
        username: POSTGRES_USERNAME,
        password: POSTGRES_PASSWORD,
        port: Number(POSTGRES_PORT),
        logging: !constants_1.__prod__,
        synchronize: true,
        entities: ['dist/**/*.entity{.ts,.js}']
    },
    redis: {
        host: REDIS_IP,
        port: Number(REDIS_PORT)
    },
    bitcoind: {
        auth: {
            username: BITCOIND_LOGIN,
            password: BITCOIND_PASSWORD
        },
        url: "http://".concat(BITCOIND_LOGIN, ":").concat(BITCOIND_PASSWORD, "@").concat(BITCOIND_IP, ":").concat(BITCOIND_PORT, "/wallet/deco")
    },
    lnd: {
        socket: "".concat(APP_LND_IP, ":").concat(APP_LND_PORT),
        cert: TLS_CERT,
        macaroon: ADMIN_MACAROON
    }
};
exports["default"] = config;
