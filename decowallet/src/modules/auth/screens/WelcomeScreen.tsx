import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { RootStackParamList } from '../../../navigation/types';
import WelcomeContainer from '../containers/WelcomeContainer';

type IProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<IProps> = ({ navigation }) => {
  const handleLogin = () => {
    navigation.push('Login');
  };

  return <WelcomeContainer onLogin={handleLogin} />;
};

export default WelcomeScreen;
