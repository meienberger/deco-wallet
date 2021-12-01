import React from 'react';
import { SafeAreaView, View } from 'react-native-picasso';
import { Button, DecoStatusBar } from '../../../components';
import PrimaryShape from '../components/PrimaryShape';

interface IProps {
  onLogin: () => void;
}

const WelcomeContainer: React.FC<IProps> = ({ onLogin }) => {
  return (
    <View className="f-1">
      <DecoStatusBar />
      <SafeAreaView className="f-1">
        <PrimaryShape />
        <View className="f-1" />
        <View className="mx-md">
          <Button variant="primary" label="Login" onPress={onLogin} />
          <Button variant="text" label="Continue as guest" textClassname="s-md" />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default WelcomeContainer;
