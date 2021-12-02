import React from 'react';
import { View } from 'react-native-picasso';
import * as yup from 'yup';
import { Formik } from 'formik';
import { Button } from '../../../components';
import DecoInput from '../../../components/DecoInput';
import ErrorDisplay from './ErrorDisplay';

interface IFormValues {
  email: string;
  password: string;
}

interface IProps {
  onSubmit: (values: IFormValues) => Promise<void>;
  fieldErrors?: Record<string, string>;
}

const LoginValidationSchema = yup.object().shape({
  password: yup.string().required('Required'),
  email: yup.string().email('Invalid email').required('Required'),
});

const LoginForm: React.FC<IProps> = ({ onSubmit, fieldErrors }) => {
  return (
    <View className="px-md pt-md">
      <Formik
        validateOnChange={false}
        validateOnBlur={true}
        initialErrors={{}}
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginValidationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await onSubmit(values);

          setSubmitting(false);
        }}
      >
        {({ values, errors, isSubmitting, handleSubmit, handleChange }) => (
          <View>
            <DecoInput onChange={handleChange('email')} value={values.email} error={errors.email || fieldErrors?.email} placeholder="Email" />
            <DecoInput onChange={handleChange('password')} value={values.password} error={errors.password || fieldErrors?.password} secureTextEntry placeholder="Password" className="mt-sm" />
            <ErrorDisplay height={36} error={`Error: ${fieldErrors?.global}`} displayed={Boolean(fieldErrors?.global)} />
            <Button label="Login" className="mt-md" onPress={handleSubmit} loading={isSubmitting} />
          </View>
        )}
      </Formik>
    </View>
  );
};

export default LoginForm;
