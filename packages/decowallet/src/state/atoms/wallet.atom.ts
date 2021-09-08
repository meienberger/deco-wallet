import { atom } from 'recoil';
import LightningWallet from '../../core/wallets/LightningWallet';

const walletState = atom<LightningWallet | null>({
  key: 'walletState',
  default: null,
});

export default walletState;
