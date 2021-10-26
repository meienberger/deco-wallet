/* eslint-disable max-statements */
import validator from 'validator';
import argon2 from 'argon2';
import { lightning } from '@deco/nodes';
import Invoice, { InvoiceTypeEnum } from '../entities/Invoice';
import { FieldError } from '../resolvers/types/error.types';
import { CreateInvoiceInput, InvoiceResponse } from '../resolvers/types/invoice.types';
import InvoiceHelpers from './helpers/invoice-helpers';
import UserController from './user.controller';

/**
 * Create a new receiving invoice
 * @param input { amount: number, description: string, userId: number }
 * @returns New invoice
 */
const createInvoice = async (input: CreateInvoiceInput & { userId: number }): Promise<InvoiceResponse> => {
  const { amount, description, userId } = input;
  const errors: FieldError[] = [];

  if (!validator.isLength(description, { max: 500 })) {
    errors.push({ field: 'description', message: 'Description is too long' });
  }

  if (amount < 100) {
    errors.push({ field: 'amount', message: 'Amount is to low' });
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
    return { errors: [{ field: 'invoiceId', message: 'Invoice not found with provided id' }] };
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
const getUserInvoices = async (userId: number): Promise<Invoice[]> => {
  return Invoice.find({ where: { userId } });
};

/**
 * Pay an invoice
 * @param request
 * @param userId
 */
const payInvoice = async (request: string, userId: number): Promise<Invoice | undefined> => {
  const balance = await UserController.getBalance(userId);

  const decodedInvoice = lightning.decodeInvoice(request);

  const invoice = await lightning.payInvoice();

  const newInvoice = await Invoice.create({
    userId,
    nativeId: invoice.id,
    request: invoice.request,
    description: invoice.description,
    type: InvoiceTypeEnum.SEND,
    amount: invoice.tokens,
    isCanceled: false,
    // isConfirmed: invoice.is_confirmed,
    // expiresAt: invoice.expirationDa,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).save();

  return Invoice.findOne({ where: { id: newInvoice.id } });
};

const InvoiceController = { createInvoice, getInvoiceAndUpdate, getUserInvoices };

export default InvoiceController;
