import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { useTheme, View } from 'react-native-picasso';

import Svg, { Path } from 'react-native-svg';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    height: height / 2.5,
  },
  svgContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -90,
  },
});

const PrimaryShape: React.FC = ({ children }) => {
  const theme = useTheme();

  return (
    <View className="bg-primary" style={styles.container}>
      <View style={styles.svgContainer}>
        <Svg width="100%" height="100" viewBox="0 0 1440 320">
          <Path
            fill={theme.colors?.primary}
            d="M0 160l40-16c40-16 120-48 200-69.3C320 53 400 43 480 42.7 560 43 640 53 720 96s160 117 240 117.3c80-.3 160-74.3 240-85.3s160 43 200 69.3l40 26.7V0H0z"
          />
        </Svg>
      </View>
      {children}
    </View>
  );
};

export default PrimaryShape;
