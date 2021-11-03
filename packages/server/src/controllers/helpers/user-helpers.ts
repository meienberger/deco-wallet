import validator from 'validator';
import * as Firebase from 'firebase-admin';
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
