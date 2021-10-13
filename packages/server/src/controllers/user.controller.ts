/* eslint-disable max-statements */
import argon2 from 'argon2';
import validator from 'validator';
import { User } from '../entities/User';
import { FieldError } from '../resolvers/types/error.types';
import { UsernamePasswordInput } from '../resolvers/types/user.types';
import UserHelpers from './helpers/user-helpers';

const login = async (input: UsernamePasswordInput): Promise<{ errors?: FieldError[]; user?: User }> => {
  const { username, password } = input;
  const errors: FieldError[] = [];

  const user = await User.findOne({ where: { username: UserHelpers.formatUsername(username) } });

  if (user) {
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      errors.push({ field: 'password', message: 'Incorrect password' });
    }
  } else {
    errors.push({ field: 'username', message: 'No user found for that email' });
  }

  return { errors, user };
};

const signup = async (input: UsernamePasswordInput): Promise<{ errors?: FieldError[]; user?: User }> => {
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

  if (errors.length === 0) {
    const hash = await argon2.hash(password);

    const newUser = await User.create({ username: UserHelpers.formatUsername(username), password: hash }).save();

    return { user: newUser, errors };
  }

  return { errors };
};

const getUser = async (userId?: number): Promise<User | null> => {
  if (!userId) {
    return null;
  }

  const user = await User.findOne({ where: { id: userId } });

  return user || null;
};

const UserController = { login, signup, getUser };

export default UserController;
