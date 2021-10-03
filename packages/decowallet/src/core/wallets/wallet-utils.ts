import bolt11 from 'bolt11';
import LNDHubService from '../../services/lndhub.service';
import { IWallet } from '../../state/atoms/wallet.atom';
import LocalStorage from '../deco/localStorage';

interface IDecodedInvoice {
  destination?: string;
  numSatoshis: string;
  numMiliSatoshis: string;
  timestamp?: string;
  fallbackAddr: string;
  routeHints: string[];
  paymentHash?: bolt11.TagData;
  descriptionHash?: bolt11.TagData;
  cltvExpiry?: string;
  expiry?: string;
  description?: bolt11.TagData;
}

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

const loadWallet = async (): Promise<IWallet> => {
  const wallet = await Storage.getItem<IWallet | null>('wallet');

  return wallet ? refreshWallet(wallet) : createWallet();
};

const saveWallet = async (wallet: IWallet): Promise<void> => {
  await Storage.setItem('wallet', wallet);
};

const upgradeInvoiceWithTags = (
  tags: {
    tagName: string;
    data: bolt11.TagData;
  }[],
  decoded: IDecodedInvoice,
) => {
  const newDecoded: IDecodedInvoice = Object.assign(decoded);

  tags.forEach(tag => {
    const { tagName, data } = tag;

    switch (tagName) {
      case 'payment_hash':
        newDecoded.paymentHash = data;

        break;
      case 'purpose_commit_hash':
        newDecoded.descriptionHash = data;

        break;
      case 'min_final_cltv_expiry':
        newDecoded.cltvExpiry = data.toString();

        break;
      case 'expire_time':
        newDecoded.expiry = data.toString();

        break;
      case 'description':
        newDecoded.description = data;

        break;

      default:
    }
  });

  return newDecoded;
};

const decodeInvoice = (invoice: string): IDecodedInvoice | null => {
  try {
    const { payeeNodeKey, tags, satoshis, millisatoshis, timestamp } = bolt11.decode(invoice);

    const decoded: IDecodedInvoice = {
      destination: payeeNodeKey,
      numSatoshis: satoshis ? satoshis.toString() : '0',
      numMiliSatoshis: millisatoshis ? millisatoshis.toString() : '0',
      timestamp: timestamp?.toString(),
      fallbackAddr: '',
      routeHints: [],
    };

    const upgradedDecoded = upgradeInvoiceWithTags(tags, decoded);

    if (!upgradedDecoded.expiry) decoded.expiry = '3600';

    if (Number.parseInt(upgradedDecoded.numSatoshis, 10) === 0 && Number(upgradedDecoded.numMiliSatoshis) > 0) {
      decoded.numSatoshis = (Number(decoded.numMiliSatoshis) / 1000).toString();
    }

    return decoded;
  } catch (error) {
    console.warn(error);

    return null;
  }
};

const walletUtils = {
  loadWallet,
  saveWallet,
  createWallet,
  refreshWallet,
  decodeInvoice,
};

export { IDecodedInvoice };
export default walletUtils;
