import validator from 'validator';
import * as Firebase from 'firebase-admin';
import { UsernamePasswordInput } from '../modules/user/user.types';
import { FieldError } from '../types/error.types';
import User from '../modules/user/user.entity';

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

/**
 * Takes a firebaseUser and returs a new or updated Deco user
 * @param firebaseUser
 * @returns User linked to this firebase auth ingo
 */
const createUserFromFirebaseUser = async (firebaseUser: Firebase.auth.UserRecord, errors: FieldError[]): Promise<User> => {
  const { email, uid } = firebaseUser;

  errors.push({ field: '', message: '' });

  if (!email) {
    throw new Error('No email provided during signup');
  }

  const user = await User.findOne({ where: { username: email } });

  const formattedEmail = formatUsername(email);

  if (!user) {
    return User.create({ username: formattedEmail, firebaseUid: uid }).save();
  }

  return user;
};

const UserHelpers = {
  formatUsername,
  validateSignupInput,
  getFirebaseUserFromToken,
  createUserFromFirebaseUser,
};

export default UserHelpers;
