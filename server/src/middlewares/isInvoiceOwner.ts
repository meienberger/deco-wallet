import { lightning } from '../services';
import { MiddlewareFn } from 'type-graphql';
import InvoiceHelpers from '../modules/invoice/invoice.helpers';
import Invoice from '../modules/invoice/invoice.entity';
import { MyContext } from '../types';
import ERROR_CODES from '../config/constants/error.codes';

const isInvoiceOwner: MiddlewareFn<MyContext> = async ({ context, args }, next) => {
  const { userId } = context.req.session;
  const { invoiceId } = args;

  const dbinvoice = await Invoice.findOne({ where: { id: invoiceId, userId } });

  if (!dbinvoice) {
    throw new Error(ERROR_CODES.invoice.notFound.toString());
  }

  const nativeInvoice = await lightning.getInvoice(dbinvoice.nativeId);

  const isOwner = await InvoiceHelpers.isInvoiceOwner(userId || -1, nativeInvoice);

  if (!isOwner) {
    throw new Error('Not invoice owner');
  }

  return next();
};

export { isInvoiceOwner };
