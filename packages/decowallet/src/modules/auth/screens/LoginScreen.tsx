import React from 'react';
import LoginContainer from '../containers/LoginContainer';

const LoginScreen: React.FC = () => {
  const handleFacebookLogin = () => {};

  return <LoginContainer onLoginFacebook={handleFacebookLogin} />;
};

export default LoginScreen;
