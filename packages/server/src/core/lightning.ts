import lnService from 'lightning';
import config from '../config';

const { lnd } = lnService.authenticatedLndGrpc({
  cert: config.lnd.cert,
  macaroon: config.lnd.macaroon,
  socket: config.lnd.url,
});

const getWalletInfo = (): Promise<lnService.GetWalletInfoResult> => {
  return lnService.getWalletInfo({ lnd });
};

const lightning = {
  getWalletInfo,
};

export default lightning;
