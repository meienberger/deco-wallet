import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useCachedResources from './hooks/useCachedRessources';
import Navigation from './navigation';
import { ThemeProvider } from 'react-native-picasso';
import { theme } from './core/styling/theme';

const App: React.FC = () => {
  const { isLoadingComplete, client } = useCachedResources();

  if (!isLoadingComplete || !client) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <SafeAreaProvider>
          <Navigation />
        </SafeAreaProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App;
