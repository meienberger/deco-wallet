/* eslint-disable camelcase */
import { Ionicons } from '@expo/vector-icons';
import { ApolloClient } from '@apollo/client';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useFonts, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { createApolloClient } from '../core/apollo/client';

interface IReturnProps {
  isLoadingComplete: boolean;
  client?: ApolloClient<unknown>;
}

export default function useCachedResources(): IReturnProps {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [client, setClient] = React.useState<ApolloClient<unknown>>();

  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_700Bold,
  });

  async function loadResourcesAndDataAsync() {
    try {
      SplashScreen.preventAutoHideAsync();

      const restoredClient = await createApolloClient();

      setClient(restoredClient);

      await Font.loadAsync({
        ...Ionicons.font,
        // eslint-disable-next-line global-require
        Inter: require('../../assets/fonts/Inter.ttf'),
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

  return { isLoadingComplete: isLoadingComplete && fontsLoaded, client };
}
