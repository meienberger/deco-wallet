import * as dotenv from 'dotenv';
import lnService from 'lightning';
import { RpcClientOptions } from 'jsonrpc-ts';

dotenv.config();

// if (process.env.NODE_ENV === 'production') {
//   dotenv.config();
// } else {
//   dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
// }

const { env } = process;
const { BITCOIND_LOGIN = '', BITCOIND_PASSWORD = '', BITCOIND_IP = '', BITCOIND_PORT = '', APP_LND_IP = '', APP_LND_PORT = '', TLS_CERT = '', ADMIN_MACAROON = '' } = env;

interface IConfig {
  bitcoind: RpcClientOptions;
  lnd: lnService.LndAuthenticationWithMacaroon;
}

const config: IConfig = {
  bitcoind: {
    auth: {
      username: BITCOIND_LOGIN,
      password: BITCOIND_PASSWORD,
    },
    url: `http://${BITCOIND_LOGIN}:${BITCOIND_PASSWORD}@${BITCOIND_IP}:${BITCOIND_PORT}/wallet/deco`,
  },
  lnd: {
    socket: `${APP_LND_IP}:${APP_LND_PORT}`,
    cert: TLS_CERT,
    macaroon: ADMIN_MACAROON,
  },
};

export default config;
