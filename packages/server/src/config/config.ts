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
  APP_LND_PASSWORD = '',
  TLS_CERT = '',
  ADMIN_MACAROON = '',
} = env;

const config = {
  NODE_ENV,
  forceStart: true,
  enableUpdateDescribeGraph: false,
  postRateLimit: 100,
  rateLimit: 200,
  logs: {
    LOGS_FOLDER,
    LOGS_APP,
    LOGS_ERROR,
  },
  bitcoind: {
    rpc: `http://${BITCOIND_LOGIN}:${BITCOIND_PASSWORD}@${BITCOIND_IP}:${BITCOIND_PORT}/wallet/wallet.dat`,
    username: BITCOIND_LOGIN,
    password: BITCOIND_PASSWORD,
  },
  postgres: {
    port: Number(POSTGRES_PORT),
    host: POSTGRES_IP,
    dbname: POSTGRES_DBNAME,
    username: POSTGRES_USERNAME,
    password: POSTGRES_PASSWORD,
  },
  lnd: {
    url: `${APP_LND_IP}:${APP_LND_PORT}`,
    password: APP_LND_PASSWORD,
    cert: TLS_CERT,
    macaroon: ADMIN_MACAROON,
  },
};

export default config;
