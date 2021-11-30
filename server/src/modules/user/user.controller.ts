/* eslint-disable max-statements */
import argon2 from 'argon2';
import * as Firebase from 'firebase-admin';
import Invoice, { InvoiceTypeEnum } from '../invoice/invoice.entity';
import User from './user.entity';
import { FieldError } from '../../utils/error.types';
import { UsernamePasswordInput, UserResponse } from './user.types';
import UserHelpers from './user.helpers';
import { forEach } from 'p-iteration';
import { lightning, bitcoin } from '../../services';
import InvoiceHelpers from '../invoice/invoice.helpers';
import ChainAddress from '../chain-address/chain-address.entity';
import ERROR_CODES from '../../config/constants/error.codes';
import { isAddressOwner } from '../../utils/bitcoin-utils';
import logger from '../../config/logger';

/**
 * Login user and set cookie
 * @param input { username: string, password: string }
 * @returns { errors: [], user: User }
 */
const login = async (input: UsernamePasswordInput): Promise<UserResponse> => {
  const { username, password } = input;
  const errors: FieldError[] = [];

  const user = await User.findOne({ where: { username: UserHelpers.formatUsername(username) } });

  if (user && user.password) {
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      errors.push({ code: ERROR_CODES.auth.invalidPassword, message: 'Incorrect password' });

      return { errors };
    }
  } else {
    errors.push({ message: 'No user found for that email', code: ERROR_CODES.auth.userNotFound });

    return { errors };
  }

  return { user, errors: errors.length > 0 ? errors : undefined };
};

/**
 * Takes a firebaseUser and returs a new or updated Deco user
 * @param firebaseUser
 * @returns User linked to this firebase auth ingo
 */
const createUserFromFirebaseUser = async (firebaseUser: Firebase.auth.UserRecord): Promise<User> => {
  const { email, uid } = firebaseUser;

  if (!email) {
    throw new Error('No email provided during signup');
  }

  const user = await User.findOne({ where: { username: email } });

  const formattedEmail = UserHelpers.formatUsername(email);

  if (!user) {
    return User.create({ username: formattedEmail, firebaseUid: uid }).save();
  }

  return user;
};

/**
 * Logs in a user from a firebase token generated client side
 * @param args
 * @returns { errors: [], user: User }
 */
const loginSocial = async (args: { token: string }): Promise<UserResponse> => {
  const { token } = args;

  const errors: FieldError[] = [];

  const firebaseUser = await UserHelpers.getFirebaseUserFromToken(token);

  if (firebaseUser) {
    const user = await createUserFromFirebaseUser(firebaseUser);

    return { user };
  }

  errors.push({ field: 'token', message: 'Invalid token provided', code: ERROR_CODES.auth.invalidToken });

  return { errors };
};

/**
 * Create new user account
 * @param input { username: string, password: string }
 * @returns { errors: [], user: User }
 */
const signup = async (input: UsernamePasswordInput): Promise<UserResponse> => {
  const { username, password } = input;

  const errors = await UserHelpers.validateSignupInput(input);

  if (errors.length === 0) {
    const hash = await argon2.hash(password);

    const formattedEmail = UserHelpers.formatUsername(username);

    const newUser = await User.create({ username: formattedEmail, password: hash }).save();

    return { user: newUser };
  }

  return { errors };
};

/**
 * Find user based on userId
 * @param userId
 * @returns User
 */
const getUser = async (userId?: number): Promise<User | null> => {
  if (!userId) {
    return null;
  }

  const user = await User.findOne({ where: { id: userId } });

  return user || null;
};

/**
 * Returns the user's balance based on ln invoices and btc transactions
 * @param userId
 * @returns Number
 */
const getBalance = async (userId: number): Promise<number> => {
  let calculatedBalance = 0;

  const invoices = await Invoice.find({ where: { userId } });

  await forEach(invoices, async invoice => {
    try {
      const nativeInvoice = await lightning.getInvoice(invoice.nativeId);
      const isOwner = await InvoiceHelpers.isInvoiceOwner(userId, nativeInvoice);

      if (isOwner && nativeInvoice.is_confirmed && invoice.type === InvoiceTypeEnum.RECEIVE) {
        calculatedBalance += nativeInvoice.tokens;
      }

      if (invoice.type === InvoiceTypeEnum.SEND && nativeInvoice.is_confirmed) {
        calculatedBalance -= nativeInvoice.tokens;
        calculatedBalance -= Number(invoice.fee);
      }
    } catch (error) {
      logger.error(`retrieving invoice ${invoice.id}. ${error}`);
    }
  });

  const userChainAddresses = await ChainAddress.find({ where: { userId } });

  await forEach(userChainAddresses, async chainAddress => {
    // check label in blockchain
    try {
      const isOwner = await isAddressOwner(chainAddress.address, userId);

      if (isOwner) {
        const received = await bitcoin.getAmountReceivedByAddress(chainAddress.address);

        calculatedBalance += received;
      }
    } catch (error) {
      logger.error(`retrieving on-chain ${chainAddress.address}. ${error}`);
    }
  });

  await User.update({ id: userId }, { balance: calculatedBalance });

  return calculatedBalance;
};

const addChainAddress = async (userId: number, chainAddress: ChainAddress): Promise<void> => {
  const user = await User.findOne({ where: { id: userId } });

  if (user) {
    user.chainAddress = chainAddress;
    await user.save();
  }
};

const UserController = { login, signup, getUser, getBalance, loginSocial, addChainAddress };

export default UserController;
