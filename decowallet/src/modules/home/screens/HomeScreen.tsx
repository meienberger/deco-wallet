import React from 'react';
import { View, Text } from 'react-native-picasso';
import { Button } from '../../../components';
import { MeDocument, useLogoutMutation } from '../../../generated/graphql';

const HomeScreen: React.FC = () => {
  const [logout] = useLogoutMutation({ refetchQueries: [{ query: MeDocument }] });

  return (
    <View className="flex-1">
      <View className="p-md">
        <Text className="s-xl w-bold">Transactions</Text>
        <Button label="Logout" onPress={logout} />
      </View>
    </View>
  );
};

export default HomeScreen;
