import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert } from 'react-native';
import { RootStackParamList } from '../../../navigation/types';
import SignupContainer from '../containers/SignupContainer';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const handleSuccess = () => {
    navigation.pop();

    Alert.alert('Success', 'You have signed up successfully. You should receive a confirmation link shortly.');
  };

  return <SignupContainer onSuccess={handleSuccess} />;
};

export default SignUpScreen;
