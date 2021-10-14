import lnService from 'lightning';
import { formatISO } from 'date-fns';
import config from '../config';
import logger from '../config/logger';
import Invoice from '../entities/Invoice';
import InvoiceHelpers from '../controllers/helpers/invoice-helpers';

interface IInvoiceInput {
  description: string;
  amount: number;
}

const { lnd } = lnService.authenticatedLndGrpc(config.lnd);

const subscribeToInvoices = (): void => {
  const subscription = lnService.subscribeToInvoices({ lnd });

  subscription.on('invoice_updated', async (invoice: lnService.GetInvoiceResult) => {
    logger.info('Invoice update', invoice);

    await Invoice.update({ nativeId: invoice.id }, {});

    // TODO: Send push notification
    // Update in db
  });
};

const getWalletInfo = (): Promise<lnService.GetWalletInfoResult> => {
  return lnService.getWalletInfo({ lnd });
};

const createInvoice = (input: IInvoiceInput): Promise<lnService.CreateInvoiceResult> => {
  const { description, amount } = input;

  const expirationDate = InvoiceHelpers.createExpirationDate();

  return lnService.createInvoice({ lnd, description, tokens: amount, expires_at: formatISO(expirationDate) });
};

const getInvoices = (invoiceIds: string[]): Promise<lnService.GetInvoiceResult[]> => {
  return Promise.all(
    invoiceIds.map(id => {
      return lnService.getInvoice({ lnd, id });
    }),
  );
};

const getInvoice = (invoiceId: string): Promise<lnService.GetInvoiceResult> => {
  return lnService.getInvoice({ lnd, id: invoiceId });
};

const lightning = {
  getWalletInfo,
  getInvoice,
  getInvoices,
  createInvoice,
  subscribeToInvoices,
};

export default lightning;
