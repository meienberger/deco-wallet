import { atom } from 'recoil';
import { IInvoice } from '../../services/lndhub.service.types';

interface IWallet {
  accessToken: string;
  accessTokenCreated: number;
  refreshToken: string;
  refreshTokenCreated: number;
  secret: string;
  balance: number;
  refillAddresses: string[];
  invoices: IInvoice[]; // TODO: Create seperate atom
}

const walletState = atom<IWallet | null>({
  key: 'walletState',
  default: null,
});

export { IWallet };
export default walletState;
