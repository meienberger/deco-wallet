import React, { useState } from 'react';
import { MeDocument, useLoginSocialMutation } from '../../../generated/graphql';
import LoginContainer from '../containers/LoginContainer';
import { loginFacebook } from '../helpers/auth-helpers';

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLoginError = () => {};

  const [loginSocial] = useLoginSocialMutation({ onError: handleLoginError, refetchQueries: [{ query: MeDocument }] });

  const loginWithToken = async (token: string) => {
    const res = await loginSocial({ variables: { token } });

    console.log(res);
  };

  const handleFacebookLogin = async () => {
    const loginResult = await loginFacebook();
    const token = await loginResult.user.getIdToken();

    loginWithToken(token);
  };

  return <LoginContainer onLoginFacebook={handleFacebookLogin} />;
};

export default LoginScreen;
