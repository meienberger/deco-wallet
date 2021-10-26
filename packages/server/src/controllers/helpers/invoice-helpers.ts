import argon2 from 'argon2';
import { addHours } from 'date-fns';
import { GetInvoiceResult } from 'lightning';
import { ARGON_HASH_LENGTH } from '../../config/constants';
import logger from '../../config/logger';

const createExpirationDate = (): Date => {
  // In one hour
  return addHours(new Date(), 1);
};

const isInvoiceOwner = async (userId: number, invoice: GetInvoiceResult): Promise<boolean> => {
  try {
    const { description } = invoice;
    const hash = description.slice(-ARGON_HASH_LENGTH);

    return await argon2.verify(hash, userId.toString());
  } catch (error) {
    logger.error(error);

    return false;
  }
};

const InvoiceHelpers = { createExpirationDate, isInvoiceOwner };

export default InvoiceHelpers;
