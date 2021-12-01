import React from 'react';
import { View } from 'react-native-picasso';
import { StatusBar, StyleSheet } from 'react-native';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';

const styles = StyleSheet.create({
  statusbar: {
    height: StaticSafeAreaInsets.safeAreaInsetsTop,
  },
});

const DecoStatusBar: React.FC = () => {
  return (
    <View className="bg-primary" style={styles.statusbar}>
      <StatusBar barStyle="light-content" translucent />
    </View>
  );
};

export default DecoStatusBar;
