/* eslint-disable max-statements */
import validator from 'validator';
import argon2 from 'argon2';
import { lightning } from '../../services';
import Invoice, { InvoiceTypeEnum } from './invoice.entity';
import { FieldError } from '../../utils/error.types';
import { CreateInvoiceInput, InvoiceResponse, PaginatedInvoicesResponse } from './invoice.types';
import InvoiceHelpers from './invoice.helpers';
import UserController from '../user/user.controller';
import { MAXIMUM_INVOICE_DESCRIPTION_LENGTH, MINIMUM_INVOICE_AMOUNT, PLATFORM_FEE } from '../../config/constants/constants';
import ERROR_CODES from '../../config/constants/error.codes';
import PaginationInput from '../common/inputs/pagination.input';
import { formatPaginationInfo } from '../common/types/pagination.types';
import { ISOToDBDate } from '../common/helpers/date.helpers';
import { MoreThan } from 'typeorm';

/**
 * Create a new receiving invoice
 * @param input { amount: number, description: string, userId: number }
 * @returns New invoice
 */
const createInvoice = async (input: CreateInvoiceInput & { userId: number }): Promise<InvoiceResponse> => {
  const { amount, description, userId } = input;
  const errors: FieldError[] = [];

  if (!validator.isLength(description, { max: MAXIMUM_INVOICE_DESCRIPTION_LENGTH })) {
    errors.push({ field: 'description', message: 'Description is too long', code: ERROR_CODES.invoice.descriptionTooLong });
  }

  if (amount < MINIMUM_INVOICE_AMOUNT) {
    errors.push({ field: 'amount', message: 'Amount is to low', code: ERROR_CODES.invoice.amountTooLow });
  }

  if (errors.length === 0) {
    const hashedUserId = await argon2.hash(userId.toString(), { hashLength: 10 });

    const descWithUserId = `${description}${hashedUserId}`;

    const expiresAt = InvoiceHelpers.createExpirationDate();

    const invoice = await lightning.createInvoice({ amount, description: descWithUserId, expirationDate: expiresAt });

    const newInvoice = await Invoice.create({
      userId,
      nativeId: invoice.id,
      request: invoice.request,
      description: invoice.description,
      type: InvoiceTypeEnum.RECEIVE,
      amount: invoice.tokens,
      isCanceled: false,
      isConfirmed: false,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).save();

    return { invoice: newInvoice };
  }

  return { errors };
};

/**
 * Get an invoice and update it from lnd
 * @param id invoice id
 * @param userId
 * @returns { errors: [], invoice: Invoice }
 */
const getInvoiceAndUpdate = async (id: number, userId: number): Promise<InvoiceResponse> => {
  const dbinvoice = await Invoice.findOne({ where: { id, userId } });

  if (!dbinvoice) {
    return { errors: [{ field: 'invoiceId', message: 'Invoice not found with provided id', code: ERROR_CODES.invoice.notFound }] };
  }

  const nativeInvoice = await lightning.getInvoice(dbinvoice.nativeId);

  await Invoice.update(
    { id, userId },
    {
      updatedAt: new Date(),
      isConfirmed: nativeInvoice.is_confirmed,
      confirmedAt: nativeInvoice.confirmed_at && new Date(nativeInvoice.confirmed_at),
    },
  );

  const invoice = await Invoice.findOne({ where: { id }, relations: ['user'] });

  return { invoice };
};

/**
 * Get all user invoices for the provided userId
 * @param userId
 */
const getUserInvoices = async (userId: number, pagination: PaginationInput): Promise<PaginatedInvoicesResponse> => {
  const { page, pageSize } = pagination;

  if (page < 1 || pageSize < 1) {
    return {
      errors: [{ field: 'pagination', message: 'Page and pageSize must be greater than 0', code: ERROR_CODES.common.invalidPaginationParams }],
    };
  }

  const [invoices, count] = await Invoice.findAndCount({
    where: { userId, expiresAt: MoreThan(ISOToDBDate(new Date().toISOString())) },
    take: pageSize,
    skip: (page - 1) * pageSize,
    order: { createdAt: 'DESC' },
  });

  return { invoices, pagination: formatPaginationInfo(count, page, pageSize) };
};

/**
 * Pay an invoice
 * @param request
 * @param userId
 */
const payInvoice = async (request: string, userId: number): Promise<boolean> => {
  // TODO: OTP Code for big amounts

  const balance = await UserController.getBalance(userId);

  const decodedInvoice = await lightning.decodeInvoice(request);

  if (balance > decodedInvoice.tokens + PLATFORM_FEE) {
    await Invoice.create({
      userId,
      nativeId: decodedInvoice.id,
      fee: PLATFORM_FEE,
      request,
      description: decodedInvoice.description,
      type: InvoiceTypeEnum.SEND,
      amount: decodedInvoice.tokens,
      isCanceled: false,
      isConfirmed: false,
      expiresAt: decodedInvoice.expires_at,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).save();

    const invoice = await Invoice.findOne({ where: { nativeId: decodedInvoice.id } });

    // Invoice correctly created in db
    if (invoice) {
      const paymentResult = await lightning.payInvoice(invoice.request);

      await Invoice.update({ nativeId: paymentResult.id }, { isConfirmed: Boolean(paymentResult.confirmed_at), confirmedAt: paymentResult.confirmed_at });

      return true;
    }

    throw new Error('Error during invoice creation');
  }

  throw new Error('User balance not sufficient');
};

const InvoiceController = { createInvoice, getInvoiceAndUpdate, getUserInvoices, payInvoice };

export default InvoiceController;
