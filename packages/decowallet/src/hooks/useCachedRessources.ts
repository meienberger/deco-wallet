import { Ionicons } from '@expo/vector-icons';
import { ApolloClient } from '@apollo/client';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { createApolloClient } from '../core/apollo/client';

const interFont = require('../../assets/fonts/Inter.ttf');

interface IReturnProps {
  isLoadingComplete: boolean;
  client?: ApolloClient<unknown>;
}

export default function useCachedResources(): IReturnProps {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [client, setClient] = React.useState<ApolloClient<unknown>>();

  async function loadResourcesAndDataAsync() {
    try {
      SplashScreen.preventAutoHideAsync();

      const restoredClient = await createApolloClient();

      setClient(restoredClient);

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

  return { isLoadingComplete, client };
}
