import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useSetRecoilState } from 'recoil';
import walletUtils from '../core/wallets/wallet-utils';
import walletState from '../state/atoms/wallet.atom';

const interFont = require('../../assets/fonts/Inter.ttf');

export default function useCachedResources(): boolean {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const setWalletState = useSetRecoilState(walletState);

  async function loadResourcesAndDataAsync() {
    try {
      SplashScreen.preventAutoHideAsync();

      const wallet = await walletUtils.loadWallet();

      setWalletState(wallet);

      await Font.loadAsync({
        ...Ionicons.font,
        Inter: interFont,
      });
    } catch (error) {
      // We might want to provide this error information to an error reporting service
      console.warn(error);
    } finally {
      setLoadingComplete(true);
      SplashScreen.hideAsync();
    }
  }

  React.useEffect(() => {
    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
