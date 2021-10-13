/* eslint-disable max-statements */
import validator from 'validator';
import { addHours } from 'date-fns';
import lightning from '../core/lightning';
import { Invoice } from '../entities/Invoice';
import { FieldError } from '../resolvers/types/error.types';
import { CreateInvoiceInput, InvoiceResponse } from '../resolvers/types/invoice.types';

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
    const invoice = await lightning.createInvoice(input);

    const newInvoice = await Invoice.create({
      userId,
      nativeId: invoice.id,
      isCanceled: false,
      isConfirmed: false,
      description: invoice.description,
      expiresAt: addHours(new Date(), 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).save();

    return { invoice: newInvoice };
  }

  return { errors };
};

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

  const invoice = await Invoice.findOne({ where: { id } });

  return { invoice };
};

const InvoiceController = { createInvoice, getInvoiceAndUpdate };

export default InvoiceController;
