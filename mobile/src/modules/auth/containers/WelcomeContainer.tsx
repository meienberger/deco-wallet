import React, { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView, View, Text } from 'react-native-picasso';
import { Button, DecoStatusBar } from '../../../components';
import { MeDocument, useLoginSocialMutation } from '../../../generated/graphql';
import PrimaryShape from '../components/PrimaryShape';
import { AuthResult, loginApple, loginFacebook, loginGoogle } from '../helpers/auth-helpers';

interface IProps {
  onSignup: () => void;
  onLogin: () => void;
}

const WelcomeContainer: React.FC<IProps> = ({ onSignup, onLogin }) => {
  const [loading, setLoading] = useState(false);

  const [loginSocial] = useLoginSocialMutation({ refetchQueries: [{ query: MeDocument }] });

  const handleLogin = (handler: () => Promise<AuthResult>) => async () => {
    setLoading(true);

    try {
      const { error, credentials } = await handler();

      if (credentials) {
        const token = await credentials.user.getIdToken();

        await loginSocial({ variables: { token } });
      }

      if (error) {
        Alert.alert('An error happened during the login process. Please retry or contact support');
      }
    } catch (error) {
      console.warn(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="f-1">
      <DecoStatusBar />
      <SafeAreaView className="f-1">
        <PrimaryShape>
          <View className="f-1 ai-c jc-c">
            <Text className="color-white size-xl">Welcome to Deco</Text>
            <Text className="color-white size-md">The easiest Bitcoin wallet</Text>
          </View>
        </PrimaryShape>
        <View className="f-1" />
        <View className="mx-md">
          <Button disabled={loading} onPress={onLogin} label="Login with Email" />
          <Button disabled={loading} onPress={handleLogin(loginApple)} className="mt-sm" label="Login with Apple" />
          <Button disabled={loading} onPress={handleLogin(loginFacebook)} className="mt-sm" label="Login with Facebook" />
          <Button disabled={loading} onPress={handleLogin(loginGoogle)} label="Login with Google" className="mt-sm" />
          <Button variant="text" label="Create an account" textClassname="s-md" onPress={onSignup} />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default WelcomeContainer;
