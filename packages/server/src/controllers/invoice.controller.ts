/* eslint-disable max-statements */
import validator from 'validator';
import { addHours } from 'date-fns';
import lightning from '../core/lightning';
import { Invoice } from '../entities/Invoice';
import { FieldError } from '../resolvers/types/error.types';
import { CreateInvoiceInput } from '../resolvers/types/invoice.types';

const createInvoice = async (input: CreateInvoiceInput & { userId: number }): Promise<{ errors?: FieldError[]; invoice?: Invoice }> => {
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
      invoiceId: invoice.id,
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

const InvoiceController = { createInvoice };

export default InvoiceController;
