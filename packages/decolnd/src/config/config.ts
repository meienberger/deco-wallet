import * as dotenv from 'dotenv';

dotenv.config();

// if (process.env.NODE_ENV === 'production') {
//   dotenv.config();
// } else {
//   dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
// }

const { env } = process;
const {
  NODE_ENV = 'development',
  LOGS_FOLDER = 'logs',
  LOGS_APP = 'app.log',
  LOGS_ERROR = 'error.log',
  APP_REDIS_IP = '10.21.21.4',
  APP_REDIS_PORT = 6379,
  APP_REDIS_PASSWORD = '',
  APP_BITCOIND_LOGIN = '',
  APP_BITCOIND_PASSWORD = '',
  APP_BITCOIND_IP = '',
  APP_BITCOIND_PORT = '',
  APP_LND_IP = '',
  APP_LND_PORT = '',
  APP_LND_PASSWORD = '',
} = env;

const config = {
  NODE_ENV,
  enableUpdateDescribeGraph: false,
  postRateLimit: 100,
  rateLimit: 200,
  logs: {
    LOGS_FOLDER,
    LOGS_APP,
    LOGS_ERROR,
  },
  bitcoind: {
    rpc: `http://${APP_BITCOIND_LOGIN}:${APP_BITCOIND_PASSWORD}@${APP_BITCOIND_IP}:${APP_BITCOIND_PORT}/wallet/wallet.dat`,
  },
  redis: {
    port: Number(APP_REDIS_PORT),
    host: APP_REDIS_IP,
    family: 4,
    password: APP_REDIS_PASSWORD,
    db: 0,
  },
  lnd: {
    url: `${APP_LND_IP}:${APP_LND_PORT}`,
    password: APP_LND_PASSWORD,
  },
};

export default config;
