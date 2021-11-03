import { useMutation, gql } from '@apollo/client';
import React from 'react';
import { View } from 'react-native-picasso';
import { Button } from '../../../components';

interface IProps {
  onLoginFacebook: () => void;
}

const LOGIN_SOCIAL_MUTATION = gql`
  mutation LoginSocial($token: String!) {
    loginSocial(token: $token) {
      id
    }
  }
`;

const LoginContainer: React.FC<IProps> = ({ onLoginFacebook }) => {
  const [loginSocial] = useMutation(LOGIN_SOCIAL_MUTATION);

  return (
    <View className="f-1 p-md">
      <Button onPress={onLoginFacebook} label="Login with Facebook" />
      <Button label="Login with Google" className="mt-sm" />
    </View>
  );
};

export default LoginContainer;
