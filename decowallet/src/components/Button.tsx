import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import clsx from 'clsx';
import { Text, TouchableOpacity, useTheme } from 'react-native-picasso';

type Variants = 'outlined' | 'primary' | 'text';

interface IProps {
  onPress?: () => void;
  label: string;
  loading?: boolean;
  variant?: Variants;
  disabled?: boolean;
  className?: string;
  textClassname?: string;
}

const styles = StyleSheet.create({
  button: {
    height: 50,
  },
  buttonText: {
    fontFamily: 'Inter_700Bold',
  },
});

const classesForVariant: Record<Variants, { button: string; text: string }> = {
  primary: { button: 'bg-primary', text: 'c-white' },
  outlined: { button: 'b-2 bc-primary', text: 'c-accent' },
  text: { button: '', text: 'c-accent' },
};

const Button: React.FC<IProps> = ({ onPress, loading, label, variant = 'primary', className, textClassname, disabled }) => {
  const theme = useTheme();
  const buttonClsx = clsx('r-md ai-c jc-c', classesForVariant[variant].button, className);
  const textClsx = clsx('s-lg weight-bold', classesForVariant[variant].text, textClassname);

  const handlePress = () => {
    if (!loading && !disabled && onPress) {
      onPress();
    }
  };

  const indicatorColor = variant === 'primary' ? 'white' : theme.colors?.primary;

  return (
    <TouchableOpacity className={buttonClsx} style={styles.button} onPress={handlePress}>
      {loading ? (
        <ActivityIndicator size="small" color={indicatorColor} />
      ) : (
        <Text style={styles.buttonText} className={textClsx}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
