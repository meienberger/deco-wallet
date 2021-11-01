import { lightning } from '../services';
import { MiddlewareFn } from 'type-graphql';
import InvoiceHelpers from '../controllers/helpers/invoice-helpers';
import Invoice from '../entities/Invoice';
import { MyContext } from '../types';

const isInvoiceOwner: MiddlewareFn<MyContext> = async ({ context, args }, next) => {
  const { userId } = context.req.session;
  const { invoiceId } = args;

  const dbinvoice = await Invoice.findOne({ where: { id: invoiceId, userId } });

  if (!dbinvoice) {
    throw new Error(`Invoice not found for id ${invoiceId}`);
  }

  const nativeInvoice = await lightning.getInvoice(dbinvoice.nativeId);

  const isOwner = await InvoiceHelpers.isInvoiceOwner(userId || -1, nativeInvoice);

  if (!isOwner) {
    throw new Error('Not invoice owner');
  }

  return next();
};

export { isInvoiceOwner };
