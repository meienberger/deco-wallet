import React, { useState } from 'react';
import { MeDocument, useLoginMutation } from '../../../generated/graphql';
import { toErrorMap } from '../../../utils/toErrorMap';
import LoginForm from '../components/LoginForm';

interface IFormValues {
  email: string;
  password: string;
}

const LoginContainer: React.FC = () => {
  const [login] = useLoginMutation({ refetchQueries: [{ query: MeDocument }] });
  const [errors, setErrors] = useState<Record<string, string>>();

  const handleFormSubmit = async (values: IFormValues) => {
    setErrors(undefined);

    const { data } = await login({ variables: { input: { username: values.email, password: values.password } } });

    if (data?.login.errors) {
      setErrors(toErrorMap(data.login.errors));
    }
  };

  return <LoginForm onSubmit={handleFormSubmit} fieldErrors={errors} />;
};

export default LoginContainer;
