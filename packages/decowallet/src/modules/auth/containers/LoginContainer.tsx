import React from 'react';
import { Text, View } from 'react-native-picasso';
import { Button } from '../../../components';

interface IProps {
  onLoginFacebook: () => void;
  loading?: boolean;
}

const LoginContainer: React.FC<IProps> = ({ onLoginFacebook, loading }) => {
  return (
    <View className="f-1 p-md jc-c">
      <Text className="a-c mb-md s-md">Choose an authentication method</Text>
      <Button disabled={loading} label="Login with Apple" />
      <Button disabled={loading} onPress={onLoginFacebook} className="mt-sm" label="Login with Facebook" />
      <Button disabled={loading} label="Login with Google" className="mt-sm" />
    </View>
  );
};

export default LoginContainer;
