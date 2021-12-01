/* eslint-disable max-statements */
import validator from 'validator';
import * as Firebase from 'firebase-admin';
import User from './user.entity';
import { FieldError } from '../../utils/error.types';
import { UsernamePasswordInput } from './user.types';
import ERROR_CODES from '../../config/constants/error.codes';

const formatUsername = (username: string): string => {
  return username.toLowerCase().trim();
};

const validateSignupInput = async (input: UsernamePasswordInput): Promise<FieldError[]> => {
  const { username, password } = input;
  const errors: FieldError[] = [];

  const email = formatUsername(username);

  if (!validator.isEmail(email)) {
    errors.push({ field: 'email', message: 'Email badly formatted', code: ERROR_CODES.auth.emailBadlyFormatted });
  }

  if (!validator.isLength(password, { min: 6 })) {
    errors.push({ field: 'password', message: 'Password is too short', code: ERROR_CODES.auth.passwordTooShort });
  }

  const user = await User.findOne({ where: { username: email } });

  if (user) {
    errors.push({ field: 'email', message: 'Email is already taken', code: ERROR_CODES.auth.emailAlreadyExists });
  }

  return errors;
};

const getFirebaseUserFromToken = async (token: string): Promise<Firebase.auth.UserRecord> => {
  const { uid } = await Firebase.auth().verifyIdToken(token);

  return Firebase.auth().getUser(uid);
};

const UserHelpers = {
  formatUsername,
  validateSignupInput,
  getFirebaseUserFromToken,
};

export default UserHelpers;
