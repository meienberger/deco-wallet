/* eslint-disable camelcase */
import fs from 'fs';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import config from '../config';

const loaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const packageDefinition = protoLoader.loadSync('rpc.proto', loaderOptions);

const { lnrpc }: any = grpc.loadPackageDefinition(packageDefinition);

process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';

const lndCert = process.env.TLSCERT ? Buffer.from(process.env.TLSCERT, 'hex') : fs.readFileSync('tls.cert');

const macaroon = process.env.MACAROON ? process.env.MACAROON : fs.readFileSync('admin.macaroon').toString('hex');

const sslCreds = grpc.credentials.createSsl(lndCert);

// eslint-disable-next-line id-length
const macaroonCreds = grpc.credentials.createFromMetadataGenerator((_, callback) => {
  const metadata = new grpc.Metadata();

  metadata.add('macaroon', macaroon);
  callback(null, metadata);
});

const creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);

// trying to unlock the wallet
if (config.lnd.password) {
  const walletUnlocker = new lnrpc.WalletUnlocker(config.lnd.url, creds);

  walletUnlocker.unlockWallet({
    wallet_password: Buffer.from(config.lnd.password).toString('base64'),
  });
}

type Transaction = { raw_tx_hex: string; label: string; num_confirmations: number; time_stamp: number };

type NewAddressCallback = (err: Error, response: { address: string }) => void;

type LookupInvoiceCallback = (err: Error, response: { amt_paid_msat?: number; amt_paid_sat: number }) => void;

type GetTransactionsCallback = (err: Error, response: { transactions: Transaction[] }) => void;

interface ILightning {
  newAddress: (params: { type: number }, callback: NewAddressCallback) => void;
  lookupInvoice: (params: { r_hash_str: string }, callback: LookupInvoiceCallback) => void;
  getTransactions: (params: any, callback: GetTransactionsCallback) => void;
}

const lightning: ILightning = new lnrpc.Lightning(config.lnd.url, creds, { 'grpc.max_receive_message_length': 1024 * 1024 * 1024 });

export { ILightning };
export default lightning;
