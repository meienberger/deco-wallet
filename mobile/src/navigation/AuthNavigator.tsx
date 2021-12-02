import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import SignUpScreen from '../modules/auth/screens/SignUpScreen';
import WelcomeScreen from '../modules/auth/screens/WelcomeScreen';

const AuthStack = createNativeStackNavigator();

function AuthNavigator(): JSX.Element {
  return (
    <AuthStack.Navigator screenOptions={{ headerBackTitleVisible: false }} initialRouteName="Welcome">
      <AuthStack.Screen name="Welcome" options={{ headerShown: false }} component={WelcomeScreen} />
      <AuthStack.Group screenOptions={{ presentation: 'modal' }}>
        <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      </AuthStack.Group>
    </AuthStack.Navigator>
  );
}

export default AuthNavigator;
