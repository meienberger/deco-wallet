import config from '../config';
import logger from '../config/logger';

import bitcoin from '../db/bitcoin';

// import lightning from '../db/lightning';
// import redis from '../db/redis';

const MIN_BTC_BLOCK = 670_000;

const initialChecks = async () => {
  const identityPubkey = '';

  if (config.bitcoind) {
    bitcoin.request('getblockchaininfo', false, function (err: any, info: any) {
      logger.info(info);
      console.log(info);
      console.log(err);

      if (info && info.result && info.result.blocks) {
        if (info.result.chain === 'mainnet' && info.result.blocks < MIN_BTC_BLOCK && !config.forceStart) {
          console.error('bitcoind is not caught up');
          process.exit(1);
        }
        console.log('bitcoind getblockchaininfo:', info);
      } else {
        console.error('bitcoind failure:', err, info);
        process.exit(2);
      }
    });
  }

  //   lightning.getInfo({}, (err, info) => {
  //     if (err) {
  //       logger.info(err);

  //       throw new Error('lnd failure');
  //     }

  //     if (info) {
  //       logger.info('lnd getinfo:', info);

  //       if (!info.synced_to_chain && !config.forceStart) {
  //         throw new Error('lnd not synced');
  //       }

  //       identityPubkey = info.identity_pubkey;
  //     }
  //   });

  //   redis.info((err, info) => {
  //     if (err || !info) {
  //       throw new Error('redis failure');
  //     }
  //   });

  return { identityPubkey };
};

export default initialChecks;
