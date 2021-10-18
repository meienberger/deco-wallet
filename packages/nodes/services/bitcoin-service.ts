import BigNumber from 'bignumber.js';
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

interface ITransaction {
  address: string;
  category: 'receive' | 'send';
  amount: number;
  label: string;
  vout: number;
  confirmations: number;
  blockhash: string;
  blockheight: number;
  blockindex: number;
  blocktime: number;
  txid: string;
  time: number;
  timereceived: number;
  'bip125-replaceable': 'yes' | 'no';
}

interface IBitcoinService {
  getblockchaininfo: () => IGetBlockchainInfoResponse;
  listtransactions: () => ITransaction[];
  getreceivedbyaddress: (params: string[]) => number;
}

const rpcClient = new RpcClient<IBitcoinService>(config.bitcoind);

const getAmountReceivedByAddress = async (address: string): Promise<number> => {
  const { data } = await rpcClient.makeRequest({
    method: 'getreceivedbyaddress',
    params: [address],
    jsonrpc: '2.0',
  });
  const { result } = data;

  return new BigNumber(result || 0).multipliedBy(100_000_000).toNumber();
};

const getBlockchainInfo = async (): Promise<IGetBlockchainInfoResponse | undefined> => {
  const { data } = await rpcClient.makeRequest({
    method: 'getblockchaininfo',
    jsonrpc: '2.0',
  });

  return data.result;
};

const bitcoin = {
  getAmountReceivedByAddress,
  getBlockchainInfo,
};

export default bitcoin;
