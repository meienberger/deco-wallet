import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName } from 'react-native';
import { RootStackParamList } from './types';
import BottomTabNavigator from './BottomTabNavigator';
import SplashScreen from '../modules/auth/screens/SplashScreen';
import { useMeQuery } from '../generated/graphql';
import AuthNavigator from './AuthNavigator';

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const RootStack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { data, loading } = useMeQuery();

  const renderMain = () => {
    if (loading) {
      return <RootStack.Screen name="Splash" component={SplashScreen} />;
    }

    if (data?.me) {
      return <RootStack.Screen name="Root" component={BottomTabNavigator} />;
    }

    return <RootStack.Screen name="Auth" component={AuthNavigator} />;
  };

  return <RootStack.Navigator screenOptions={{ headerShown: false }}>{renderMain()}</RootStack.Navigator>;
}

export default function Navigation({ colorScheme }: { colorScheme?: ColorSchemeName }): JSX.Element {
  return (
    <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
