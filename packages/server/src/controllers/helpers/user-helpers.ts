import validator from 'validator';
import User from '../../entities/User';
import { FieldError } from '../../resolvers/types/error.types';
import { UsernamePasswordInput } from '../../resolvers/types/user.types';

const formatUsername = (username: string): string => {
  return username.toLowerCase().trim();
};

const validateSignupInput = async (input: UsernamePasswordInput): Promise<FieldError[]> => {
  const { username, password } = input;
  const errors: FieldError[] = [];

  if (!validator.isEmail(username)) {
    errors.push({ field: 'email', message: 'Email badly formatted' });
  }

  if (!validator.isLength(password, { min: 4 })) {
    errors.push({ field: 'password', message: 'Password is too short' });
  }

  const user = await User.findOne({ where: { username } });

  if (user) {
    errors.push({ field: 'username', message: 'Username is already taken' });
  }

  return errors;
};

const UserHelpers = {
  formatUsername,
  validateSignupInput,
};

export default UserHelpers;
