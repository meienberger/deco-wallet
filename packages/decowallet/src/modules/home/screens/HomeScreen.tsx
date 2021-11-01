import React from 'react';
import { View, Text } from 'react-native-picasso';

const HomeScreen: React.FC = () => {
  return (
    <View className="flex-1">
      <View className="p-md">
        <Text className="s-xl w-bold">Transactions</Text>
      </View>
    </View>
  );
};

export default HomeScreen;
