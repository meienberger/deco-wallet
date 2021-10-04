import config from '../config';
import logger from '../config/logger';
import bitcoin from '../db/bitcoin';
import lightning from '../db/lightning';

// import redis from '../db/redis';

const MIN_BTC_BLOCK = 670_000;

const checkLightning = async (): Promise<string> => {
  const wallet = await lightning.getWalletInfo();

  return wallet.public_key;
};

const checkBitcoin = async () => {
  const { data } = await bitcoin.makeRequest({ method: 'getblockchaininfo', jsonrpc: '2.0' });

  const info = data.result;

  if (info && info.blocks) {
    if (info.chain === 'mainnet' && info.blocks < MIN_BTC_BLOCK && !config.forceStart) {
      logger.error('bitcoind is not caught up');

      throw new Error('bitcoind is not caught up');
    }
  } else {
    throw new Error('Bitcoind failure');
  }
};

// const checkRedis = () => {
//   redis.info((err, info) => {
//     if (err || !info) {
//       throw new Error('redis failure');
//     }
//   });
// };

const initialChecks = async (): Promise<{ identityPubkey: string }> => {
  await checkBitcoin();

  const identityPubkey = await checkLightning();

  return { identityPubkey };
};

export default initialChecks;
