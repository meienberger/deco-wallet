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

const bitcoin = new RpcClient<IBitcoinService>({ auth: { username: 'username', password: 'password' }, url: config.bitcoind.rpc });

export default bitcoin;
