import { Injectable } from '@nestjs/common';
import { forEach } from 'p-iteration';
import argon2 from 'argon2';
import { bitcoin, lightning } from '../../services';
import { FieldError } from '../../types/error.types';
import InvoiceHelpers from '../../utils/invoice-helpers';
import UserHelpers from '../../utils/user-helpers';
import ChainAddress from '../chain-address/chain-address.entity';
import Invoice from '../invoice/invoice.entity';
import { InvoiceTypeEnum } from '../invoice/invoice.types';
import User from './user.entity';
import { UsernamePasswordInput, UserResponse } from './user.types';

@Injectable()
export class UserService {
  /**
   * Find user based on userId
   * @param userId
   * @returns User
   */
  async getUser(userId?: number): Promise<User | null> {
    if (!userId) {
      return null;
    }

    const user = await User.findOne({ where: { id: userId } });

    return user || null;
  }

  /**
   * Login user and set cookie
   * @param input { username: string, password: string }
   * @returns { errors: [], user: User }
   */
  async login(input: UsernamePasswordInput): Promise<UserResponse> {
    const { username, password } = input;
    const errors: FieldError[] = [];

    const user = await User.findOne({ where: { username: UserHelpers.formatUsername(username) } });

    if (user && user.password) {
      const isPasswordValid = await argon2.verify(user.password, password);

      if (!isPasswordValid) {
        errors.push({ field: 'password', message: 'Incorrect password' });
      }
    } else {
      errors.push({ field: 'username', message: 'No user found for that email' });
    }

    return { errors, user };
  }

  /**
   * Create new user account
   * @param input { username: string, password: string }
   * @returns { errors: [], user: User }
   */
  async signup(input: UsernamePasswordInput): Promise<UserResponse> {
    const { username, password } = input;

    const errors = await UserHelpers.validateSignupInput(input);

    if (errors.length === 0) {
      const hash = await argon2.hash(password);

      const formattedEmail = UserHelpers.formatUsername(username);

      const newUser = await User.create({ username: formattedEmail, password: hash }).save();

      return { user: newUser };
    }

    return { errors };
  }

  /**
   * Logs in a user from a firebase token generated client side
   * @param args
   * @returns { errors: [], user: User }
   */
  async loginSocial(args: { token: string }): Promise<UserResponse> {
    const { token } = args;

    const errors: FieldError[] = [];

    const firebaseUser = await UserHelpers.getFirebaseUserFromToken(token);

    if (firebaseUser) {
      const user = await UserHelpers.createUserFromFirebaseUser(firebaseUser, errors);

      return { user };
    }

    errors.push({ field: 'token', message: 'Invalid token provided' });

    return { errors };
  }

  /**
   * Returns the user's balance based on ln invoices and btc transactions
   * @param userId
   * @returns Number
   */
  async getBalance(userId: number): Promise<number> {
    let calculatedBalance = 0;

    const invoices = await Invoice.find({ where: { userId } });

    await forEach(invoices, async (invoice: Invoice) => {
      const nativeInvoice = await lightning.getInvoice(invoice.nativeId);

      const isOwner = await InvoiceHelpers.isInvoiceOwner(userId, nativeInvoice);

      if (isOwner && nativeInvoice.is_confirmed && invoice.type === InvoiceTypeEnum.RECEIVE) {
        calculatedBalance += nativeInvoice.tokens;
      }

      if (invoice.type === InvoiceTypeEnum.SEND && nativeInvoice.is_confirmed) {
        calculatedBalance -= nativeInvoice.tokens + Number(invoice.fee);
      }
    });

    const userChainAddresses = await ChainAddress.find({ where: { userId } });

    await forEach(userChainAddresses, async (chainAddress: ChainAddress) => {
      const received = await bitcoin.getAmountReceivedByAddress(chainAddress.address);

      calculatedBalance += received;
    });

    return calculatedBalance;
  }
}
