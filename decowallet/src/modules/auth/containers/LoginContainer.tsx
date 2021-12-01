import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Text, View } from 'react-native-picasso';
import { Button } from '../../../components';
import { MeDocument, useLoginSocialMutation } from '../../../generated/graphql';
import { loginFacebook, loginGoogle, loginApple, AuthResult } from '../helpers/auth-helpers';

const LoginContainer: React.FC = () => {
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
    <View className="f-1 p-md jc-c">
      <Text className="a-c mb-md s-md">Choose an authentication method</Text>
      <Button disabled={loading} onPress={handleLogin(loginApple)} label="Login with Apple" />
      <Button disabled={loading} onPress={handleLogin(loginFacebook)} className="mt-sm" label="Login with Facebook" />
      <Button disabled={loading} onPress={handleLogin(loginGoogle)} label="Login with Google" className="mt-sm" />
    </View>
  );
};

export default LoginContainer;
