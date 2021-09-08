import LocalStorage from '../deco/localStorage';
import LightningWallet from './LightningWallet';

const Storage = new LocalStorage('decowallet');

const createWallet = async (): Promise<LightningWallet> => {
  const lndw = new LightningWallet({ baseUri: 'http://192.168.1.111:3008/' });

  await lndw.createAccount(true);
  await lndw.getNewAddress();

  return lndw;
};

const loadWallet = async (): Promise<LightningWallet | null> => {
  const wallet = await Storage.getItem<LightningWallet>('wallet');

  if (wallet) {
    const serealizedWallet = LightningWallet.fromJson(wallet);

    await serealizedWallet.authorize();
    await serealizedWallet.fetchBalance();
    await serealizedWallet.fetchTransactions();

    return serealizedWallet;
  }

  return null;
};

const saveWallet = async (wallet: LightningWallet): Promise<void> => {
  await Storage.setItem('wallet', wallet);
};

const walletUtils = {
  loadWallet,
  saveWallet,
  createWallet,
};

export default walletUtils;
