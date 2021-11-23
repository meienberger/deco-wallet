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
  getreceivedbyaddress: (params: [string, number]) => number;
  getnewaddress: (params: [string, string]) => string;
  sendtoaddress: (params: [string, number]) => string;
}

const rpcClient = new RpcClient<IBitcoinService>(config.bitcoind);

/**
 * Returns the amount of satoshis received by an onchain address
 * @param address
 * @returns number
 */
const getAmountReceivedByAddress = async (address: string): Promise<number> => {
  const confirmations = config.NODE_ENV === 'test' ? 0 : 3;

  const { data } = await rpcClient.makeRequest({
    method: 'getreceivedbyaddress',
    params: [address, confirmations],
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

const createNewAddress = async (userId: number): Promise<string | undefined> => {
  const { data } = await rpcClient.makeRequest({
    method: 'getnewaddress',
    params: [userId.toString(), 'bech32'],
    jsonrpc: '2.0',
  });

  return data.result;
};

const sendToAddress = async (address: string, amount: number): Promise<string | undefined> => {
  if (config.NODE_ENV !== 'test') {
    throw new Error('Cannot send to address in production');
  }

  const { data } = await rpcClient.makeRequest({
    method: 'sendtoaddress',
    params: [address, amount],
    jsonrpc: '2.0',
  });

  return data.result;
};

const bitcoin = {
  getAmountReceivedByAddress,
  getBlockchainInfo,
  createNewAddress,
  sendToAddress,
};

export default bitcoin;
