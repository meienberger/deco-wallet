import * as dotenv from 'dotenv';
import redis from 'redis';
import lnService from 'lightning';
import { createConnection } from 'typeorm';
import { User } from '../entities/User';
import { __prod__ } from './constants';
import { RpcClientOptions } from 'jsonrpc-ts';
import { Invoice } from '../entities/Invoice';
import { ChainAddress } from '../entities/ChainAddress';

dotenv.config();

// if (process.env.NODE_ENV === 'production') {
//   dotenv.config();
// } else {
//   dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
// }

const { env } = process;
const {
  NODE_ENV = 'development',
  APP_PORT = 3000,
  LOGS_FOLDER = 'logs',
  LOGS_APP = 'app.log',
  LOGS_ERROR = 'error.log',
  POSTGRES_IP = '10.21.21.4',
  POSTGRES_PORT = 5432,
  POSTGRES_DBNAME = '',
  POSTGRES_USERNAME = '',
  POSTGRES_PASSWORD = '',
  BITCOIND_LOGIN = '',
  BITCOIND_PASSWORD = '',
  BITCOIND_IP = '',
  BITCOIND_PORT = '',
  APP_LND_IP = '',
  APP_LND_PORT = '',
  TLS_CERT = '',
  ADMIN_MACAROON = '',
  REDIS_IP = '',
  REDIS_PORT = 6379,
  COOKIE_SECRET = '',
} = env;

interface IConfig {
  NODE_ENV: string;
  APP_PORT: number;
  COOKIE_SECRET: string;
  forceStart: boolean;
  logs: {
    LOGS_FOLDER: string;
    LOGS_APP: string;
    LOGS_ERROR: string;
  };
  bitcoind: RpcClientOptions;
  typeorm: Parameters<typeof createConnection>[0];
  lnd: lnService.LndAuthenticationWithMacaroon;
  redis: redis.ClientOpts;
}

const config: IConfig = {
  NODE_ENV,
  COOKIE_SECRET,
  APP_PORT: Number(APP_PORT),
  forceStart: true,
  logs: {
    LOGS_FOLDER,
    LOGS_APP,
    LOGS_ERROR,
  },
  bitcoind: {
    auth: {
      username: BITCOIND_LOGIN,
      password: BITCOIND_PASSWORD,
    },
    url: `http://${BITCOIND_LOGIN}:${BITCOIND_PASSWORD}@${BITCOIND_IP}:${BITCOIND_PORT}/wallet/wallet.dat`,
  },
  typeorm: {
    type: 'postgres',
    host: POSTGRES_IP,
    database: POSTGRES_DBNAME,
    username: POSTGRES_USERNAME,
    password: POSTGRES_PASSWORD,
    port: Number(POSTGRES_PORT),
    logging: !__prod__,
    synchronize: true,
    entities: [User, Invoice, ChainAddress],
  },
  lnd: {
    socket: `${APP_LND_IP}:${APP_LND_PORT}`,
    cert: TLS_CERT,
    macaroon: ADMIN_MACAROON,
  },
  redis: {
    host: REDIS_IP,
    port: Number(REDIS_PORT),
  },
};

export default config;
