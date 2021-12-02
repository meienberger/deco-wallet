import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { RootStackParamList } from '../../../navigation/types';
import WelcomeContainer from '../containers/WelcomeContainer';

type IProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<IProps> = ({ navigation }) => {
  const handleSignup = () => {
    navigation.push('SignUp');
  };

  return <WelcomeContainer onSignup={handleSignup} />;
};

export default WelcomeScreen;
