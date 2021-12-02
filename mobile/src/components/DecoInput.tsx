import clsx from 'clsx';
import React, { useState } from 'react';
import { TextInput } from 'react-native-picasso';
import { motify, MotiView } from 'moti';
import ErrorDisplay from '../modules/auth/components/ErrorDisplay';

interface IProps {
  error?: string;
  className?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  value?: string;
  onChange?: (text: string) => void;
}

const MotiInput = motify(TextInput)();

const DecoInput: React.FC<IProps> = ({ error, className, placeholder, secureTextEntry, onChange, value, autoCapitalize = 'none', autoCorrect = false }) => {
  const [active, setActive] = useState(false);

  return (
    <MotiView>
      <MotiInput
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        animate={{ transform: [{ scale: active ? 1.02 : 1 }], borderWidth: active ? 2 : 1 }}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        className={clsx('bg-gray b-2 p-sm size-md r-md py-md bc-secondary bg-white', className, { 'bc-primary': active }, { 'bc-red': error })}
        onChangeText={onChange}
        value={value}
      />
      <ErrorDisplay error={error} className="ml-sm c-red" />
    </MotiView>
  );
};

export default DecoInput;
