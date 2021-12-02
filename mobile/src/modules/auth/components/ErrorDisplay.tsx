import React from 'react';
import { AnimatePresence, MotiView } from 'moti';
import { Text } from 'react-native-picasso';

interface IProps {
  error?: string;
  className?: string;
  height?: number;
  displayed?: boolean;
}

const ErrorDisplay: React.FC<IProps> = ({ error, className = 'a-c mt-md c-red', height = 20, displayed = true }) => {
  return (
    <AnimatePresence>
      {Boolean(displayed && error) && (
        <MotiView
          from={{
            opacity: 0,
            height: 0,
            marginTop: 0,
          }}
          animate={{
            opacity: 1,
            height,
            marginTop: 5,
          }}
          exit={{
            opacity: 0,
            height: 0,
            marginTop: 0,
          }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <Text className={className}>{error}</Text>
        </MotiView>
      )}
    </AnimatePresence>
  );
};

export default ErrorDisplay;
