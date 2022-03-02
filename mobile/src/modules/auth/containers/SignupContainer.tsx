import React, { useState } from 'react';
import { useSignupMutationMutation } from '../../../generated/graphql';
import { toErrorMap } from '../../../utils/toErrorMap';
import SignUpForm from '../components/SignupForm';

interface IFormValues {
  email: string;
  password: string;
}

interface IProps {
  onSuccess: () => void;
}

const SignupContainer: React.FC<IProps> = ({ onSuccess }) => {
  const [signup] = useSignupMutationMutation();
  const [errors, setErrors] = useState<Record<string, string>>();

  const handleFormSubmit = async (values: IFormValues) => {
    // Reset errors
    setErrors(undefined);

    const { data } = await signup({ variables: { input: { username: values.email, password: values.password } } });

    if (data?.register.errors) {
      setErrors(toErrorMap(data.register.errors));
    } else {
      onSuccess();
    }
  };

  return <SignUpForm onSubmit={handleFormSubmit} fieldErrors={errors} />;
};

export default SignupContainer;
