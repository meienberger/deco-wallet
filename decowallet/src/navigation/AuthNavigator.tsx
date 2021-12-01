import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import LoginScreen from '../modules/auth/screens/LoginScreen';
import WelcomeScreen from '../modules/auth/screens/WelcomeScreen';

const AuthStack = createNativeStackNavigator();

function AuthNavigator(): JSX.Element {
  return (
    <AuthStack.Navigator screenOptions={{ headerBackTitleVisible: false }} initialRouteName="Welcome">
      <AuthStack.Screen name="Welcome" options={{ headerShown: false }} component={WelcomeScreen} />
      <AuthStack.Screen name="Login" options={{ title: 'Choose a login method' }} component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

export default AuthNavigator;
