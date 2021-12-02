import argon2 from 'argon2';
import { addHours } from 'date-fns';
import { ARGON_HASH_LENGTH } from '../../config/constants/constants';

const createExpirationDate = (): Date => {
  // In one hour
  return addHours(new Date(), 1);
};

const isInvoiceOwner = async (userId: number, invoice: { description: string }): Promise<boolean> => {
  try {
    const { description } = invoice;
    const hash = description.slice(-ARGON_HASH_LENGTH);

    return await argon2.verify(hash, userId.toString());
  } catch {
    return false;
  }
};

const InvoiceHelpers = { createExpirationDate, isInvoiceOwner };

export default InvoiceHelpers;