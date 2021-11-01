import { atom } from 'recoil';

interface IWallet {
  accessToken: string;
  accessTokenCreated: number;
  refreshToken: string;
  refreshTokenCreated: number;
  secret: string;
  balance: number;
  refillAddresses: string[];
}

const walletState = atom<IWallet | null>({
  key: 'walletState',
  default: null,
});

export { IWallet };
export default walletState;
