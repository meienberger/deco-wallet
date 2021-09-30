import LNDHubService from '../../services/lndhub.service';
import { IWallet } from '../../state/atoms/wallet.atom';
import LocalStorage from '../deco/localStorage';

const Storage = new LocalStorage('decowallet');

const createWallet = async (): Promise<IWallet> => {
  const secret = await LNDHubService.createAccount();
  const { refreshToken, accessToken } = await LNDHubService.authorize(secret);
  const invoices = await LNDHubService.getUserInvoices(accessToken, []);
  const refillAddresses = await LNDHubService.getBtcAddresses(accessToken);

  return {
    accessToken,
    refreshToken,
    invoices,
    accessTokenCreated: +Number(Date.now()),
    refreshTokenCreated: +Number(Date.now()),
    secret,
    balance: 0,
    refillAddresses,
  };
};

const refreshWallet = async (wallet: IWallet): Promise<IWallet> => {
  const { refreshToken, accessToken } = await LNDHubService.authorize(wallet.secret);
  const invoices = await LNDHubService.getUserInvoices(accessToken, []);
  const refillAddresses = await LNDHubService.getBtcAddresses(accessToken);
  const { balance } = await LNDHubService.fetchBalance(accessToken);

  return {
    ...wallet,
    refreshToken,
    accessToken,
    invoices,
    refillAddresses,
    balance,
  };
};

const loadWallet = async (): Promise<IWallet | null> => {
  const wallet = await Storage.getItem<IWallet | null>('wallet');

  if (wallet) {
    return refreshWallet(wallet);
  }

  return null;
};

const saveWallet = async (wallet: IWallet): Promise<void> => {
  await Storage.setItem('wallet', wallet);
};

const walletUtils = {
  loadWallet,
  saveWallet,
  createWallet,
  refreshWallet,
};

export default walletUtils;
