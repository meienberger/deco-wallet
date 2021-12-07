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

const SignupValidationSchema = yup.object().shape({
  password: yup.string().min(7, 'auth.passwordTooShortError').required('form.required'),
  passwordConfirm: yup
    .string()
    .required('auth.confirmPasswordError')
    .oneOf([yup.ref('password')], 'auth.passwordNotMatchError'),
  email: yup.string().email('auth.invalidEmailError').required('form.required'),
});

const SignUpForm: React.FC<IProps> = ({ onSubmit, fieldErrors }) => {
  const { t } = useTranslation();

  return (
    <View className="px-md pt-md">
      <Formik
        validateOnChange={false}
        validateOnBlur={true}
        initialValues={{ email: '', password: '', passwordConfirm: '' }}
        validationSchema={SignupValidationSchema}
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
              placeholder={t('common.password')}
              className="mt-sm"
            />
            <DecoInput
              onChange={handleChange('passwordConfirm')}
              value={values.passwordConfirm}
              error={t(errors.passwordConfirm || fieldErrors?.passwordConfirm || '')}
              secureTextEntry
              placeholder={t('auth.confirmPasswordPlaceholder')}
              className="mt-sm"
            />
            <ErrorDisplay height={36} error={t(`errors.${fieldErrors?.global}`)} displayed={Boolean(fieldErrors?.global)} />
            <Button label={t('auth.createAccountButton')} className="mt-md" onPress={handleSubmit} loading={isSubmitting} />
          </View>
        )}
      </Formik>
    </View>
  );
};

export default SignUpForm;
