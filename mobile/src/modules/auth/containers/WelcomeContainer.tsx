import React, { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView, View, Text } from 'react-native-picasso';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
            <Text className="color-white size-xl a-c">{t('welcome')}</Text>
            <Text className="color-white size-md a-c">{t('welcomeSubtitle')}</Text>
          </View>
        </PrimaryShape>
        <View className="f-1" />
        <View className="mx-md">
          <Button disabled={loading} onPress={onLogin} label={t('auth.loginEmailButton')} />
          <Button disabled={loading} onPress={handleLogin(loginApple)} className="mt-sm" label={t('auth.loginAppleButton')} />
          <Button disabled={loading} onPress={handleLogin(loginFacebook)} className="mt-sm" label={t('auth.loginFacebookButton')} />
          <Button disabled={loading} onPress={handleLogin(loginGoogle)} className="mt-sm" label={t('auth.loginGoogleButton')} />
          <Button variant="text" textClassname="s-md" onPress={onSignup} label={t('auth.createAccountButton')} />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default WelcomeContainer;
