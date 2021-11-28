import { lightning, bitcoin } from '.';
import config from '../config';
import logger from '../config/logger';
import Invoice from '../modules/invoice/invoice.entity';
import { Topic } from '../modules/common/types/subscription.topics';
import InvoiceController from '../modules/invoice/invoice.controller';
import { pubSub } from '../core/subscriptionServer';

const MIN_BTC_BLOCK = 703_000;

const checkLightning = async (): Promise<string> => {
  const wallet = await lightning.getWalletInfo();

  lightning.subscribeToInvoices(async invoice => {
    logger.info('Invoice update', invoice);

    const dbInvoice = await Invoice.findOne({ where: { nativeId: invoice.id } });

    if (dbInvoice) {
      const updatedInvoice = await InvoiceController.getInvoiceAndUpdate(dbInvoice.id, dbInvoice.userId);

      await pubSub.publish(Topic.InvoiceUpdate, updatedInvoice);
      await pubSub.publish(Topic.AllInvoicesUpdate, updatedInvoice);

      // Send user notification
    }
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

const initialChecks = async (): Promise<void> => {
  try {
    await checkBitcoin();
  } catch (error) {
    logger.error('Checks failed for Bitcoin');
    logger.error(error);
  }

  try {
    await checkLightning();
  } catch (error) {
    logger.error('Checks failed for lnd');
    logger.error(JSON.stringify(error));
  }
};

export default initialChecks;
