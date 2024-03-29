import { lightning, bitcoin } from '@deco/nodes';
import config from '../config';
import logger from '../config/logger';

const MIN_BTC_BLOCK = 703_000;

const checkLightning = async (): Promise<string> => {
  const wallet = await lightning.getWalletInfo();

  lightning.subscribeToInvoices(invoice => {
    logger.info('Invoice update', invoice);
  });

  return wallet.public_key;
};

const checkBitcoin = async () => {
  const info = await bitcoin.getBlockchainInfo();

  if (info && info.blocks) {
    if (info.chain === 'mainnet' && info.blocks < MIN_BTC_BLOCK && !config.forceStart) {
      logger.error('bitcoind is not caught up');

      throw new Error('bitcoind is not caught up');
    }
  } else {
    throw new Error('Bitcoind failure');
  }
};

const initialChecks = async (): Promise<{ identityPubkey: string }> => {
  await checkBitcoin();

  const identityPubkey = await checkLightning();

  return { identityPubkey };
};

export default initialChecks;
