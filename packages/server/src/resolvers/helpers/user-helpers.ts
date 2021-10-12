import { Field, InputType } from 'type-graphql';
import validator from 'validator';
import { FieldError } from './error-helpers';

@InputType()
class UsernamePasswordInput {
  @Field()
  username!: string;

  @Field()
  password!: string;
}

const formatUsername = (username: string): string => {
  return username.toLowerCase().trim();
};

const validateUsernamePassword = (input: UsernamePasswordInput): FieldError[] => {
  const { username, password } = input;
  const errors: FieldError[] = [];

  if (!validator.isEmail(username)) {
    errors.push({ field: 'email', message: 'Email badly formatted' });
  }

  if (!validator.isLength(password, { min: 4 })) {
    errors.push({ field: 'password', message: 'Password is too short' });
  }

  return errors;
};

const UserHelpers = {
  formatUsername,
  validateUsernamePassword,
};

export { UsernamePasswordInput };

export default UserHelpers;
