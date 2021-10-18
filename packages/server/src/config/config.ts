import * as dotenv from 'dotenv';
import redis from 'redis';
import { createConnection } from 'typeorm';
import User from '../entities/User';
import { __prod__ } from './constants';
import Invoice from '../entities/Invoice';
import ChainAddress from '../entities/ChainAddress';

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
  REDIS_IP = '',
  REDIS_PORT = 6379,
  COOKIE_SECRET = '',
  HASH_SECRET = '',
} = env;

interface IConfig {
  NODE_ENV: string;
  APP_PORT: number;
  COOKIE_SECRET: string;
  HASH_SECRET: string;
  forceStart: boolean;
  logs: {
    LOGS_FOLDER: string;
    LOGS_APP: string;
    LOGS_ERROR: string;
  };
  typeorm: Parameters<typeof createConnection>[0];
  redis: redis.ClientOpts;
}

const config: IConfig = {
  NODE_ENV,
  COOKIE_SECRET,
  HASH_SECRET,
  APP_PORT: Number(APP_PORT),
  forceStart: true,
  logs: {
    LOGS_FOLDER,
    LOGS_APP,
    LOGS_ERROR,
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
  redis: {
    host: REDIS_IP,
    port: Number(REDIS_PORT),
  },
};

export default config;
