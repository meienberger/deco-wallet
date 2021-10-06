import { RpcClient } from 'jsonrpc-ts';
import config from '../config';

interface IGetBlockchainInfoResponse {
  chain: 'test' | 'mainnet';
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  mediantime: number;
  verificationprogress: number;
  initialblockdownload: boolean;
  pruned: boolean;
  warnings: string;
}

interface IBitcoinService {
  getblockchaininfo: () => IGetBlockchainInfoResponse;
}

const bitcoin = new RpcClient<IBitcoinService>({ auth: { username: config.bitcoind.username, password: config.bitcoind.password }, url: config.bitcoind.rpc });

export default bitcoin;
