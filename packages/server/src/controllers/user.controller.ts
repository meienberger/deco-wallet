import argon2 from 'argon2';
import Invoice, { InvoiceTypeEnum } from '../entities/Invoice';
import User from '../entities/User';
import { FieldError } from '../resolvers/types/error.types';
import { UsernamePasswordInput, UserResponse } from '../resolvers/types/user.types';
import UserHelpers from './helpers/user-helpers';
import { forEach } from 'p-iteration';
import { lightning, bitcoin } from '@deco/nodes';
import InvoiceHelpers from './helpers/invoice-helpers';
import ChainAddress from '../entities/ChainAddress';

/**
 * Login user and set cookie
 * @param input { username: string, password: string }
 * @returns { errors: [], user: User }
 */
const login = async (input: UsernamePasswordInput): Promise<UserResponse> => {
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

    const newUser = await User.create({ username: UserHelpers.formatUsername(username), password: hash }).save();

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
    const nativeInvoice = await lightning.getInvoice(invoice.nativeId);

    const isOwner = await InvoiceHelpers.isInvoiceOwner(userId, nativeInvoice);

    if (isOwner && nativeInvoice.is_confirmed && invoice.type === InvoiceTypeEnum.RECEIVE) {
      calculatedBalance += nativeInvoice.tokens;
    }
  });

  const userChainAddresses = await ChainAddress.find({ where: { userId } });

  await forEach(userChainAddresses, async chainAddress => {
    const received = await bitcoin.getAmountReceivedByAddress(chainAddress.address);

    calculatedBalance += received;
  });

  return calculatedBalance;
};

const UserController = { login, signup, getUser, getBalance };

export default UserController;
