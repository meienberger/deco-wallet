import lnService from 'lightning';
import config from '../config';

const { lnd } = lnService.authenticatedLndGrpc(config.lnd);

const getWalletInfo = (): Promise<lnService.GetWalletInfoResult> => {
  return lnService.getWalletInfo({ lnd });
};

const lightning = {
  getWalletInfo,
};

export default lightning;
