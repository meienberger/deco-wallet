import React from 'react';
import { View } from 'react-native-picasso';
import * as yup from 'yup';
import { Formik } from 'formik';
import { Button } from '../../../components';
import DecoInput from '../../../components/DecoInput';
import ErrorDisplay from './ErrorDisplay';
import { useTranslation } from 'react-i18next';

interface IFormValues {
  email: string;
  password: string;
}

interface IProps {
  onSubmit: (values: IFormValues) => Promise<void>;
  fieldErrors?: Record<string, string>;
}

const LoginValidationSchema = yup.object().shape({
  password: yup.string().required('form.required'),
  email: yup.string().email('auth.invalidEmailError').required('form.required'),
});

const LoginForm: React.FC<IProps> = ({ onSubmit, fieldErrors }) => {
  const { t } = useTranslation();

  return (
    <View className="px-md pt-md">
      <Formik
        validateOnChange={false}
        validateOnBlur={true}
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginValidationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await onSubmit(values);

          setSubmitting(false);
        }}
      >
        {({ values, errors, isSubmitting, handleSubmit, handleChange }) => (
          <View>
            <DecoInput onChange={handleChange('email')} value={values.email} error={t(errors.email || fieldErrors?.email || '')} placeholder={t('common.email')} />
            <DecoInput
              onChange={handleChange('password')}
              value={values.password}
              error={t(errors.password || fieldErrors?.password || '')}
              secureTextEntry
              className="mt-sm"
              placeholder={t('common.password')}
            />
            <ErrorDisplay height={36} error={t(`errors.${fieldErrors?.global}`)} className="mt-md a-c" displayed={Boolean(fieldErrors?.global)} />
            <Button label={t('auth.loginButton')} className="mt-md" onPress={handleSubmit} loading={isSubmitting} />
          </View>
        )}
      </Formik>
    </View>
  );
};

export default LoginForm;
