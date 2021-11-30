import lnService from 'lightning';
import config from '../config';

interface IInvoiceInput {
  description: string;
  expirationDate: Date;
  amount: number;
}

const { lnd } = lnService.authenticatedLndGrpc(config.lnd);

const subscribeToInvoices = (callback: (invoice: lnService.GetInvoiceResult) => void): void => {
  const subscription = lnService.subscribeToInvoices({ lnd });

  subscription.on('invoice_updated', (invoice: lnService.GetInvoiceResult) => {
    callback(invoice);
  });
};

const getWalletInfo = (): Promise<lnService.GetWalletInfoResult> => {
  return lnService.getWalletInfo({ lnd });
};

const createInvoice = (input: IInvoiceInput): Promise<lnService.CreateInvoiceResult> => {
  const { description, amount, expirationDate } = input;

  return lnService.createInvoice({
    lnd,
    description,
    tokens: amount,
    expires_at: expirationDate.toISOString(),
  });
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

const decodeInvoice = (paymentRequest: string): Promise<lnService.DecodePaymentRequestResult> => {
  return lnService.decodePaymentRequest({ request: paymentRequest, lnd });
};

const payInvoice = (paymentRequest: string): Promise<lnService.PayViaPaymentRequestResult> => {
  return lnService.payViaPaymentRequest({ lnd, request: paymentRequest });
};

const lightning = {
  getWalletInfo,
  getInvoice,
  getInvoices,
  createInvoice,
  subscribeToInvoices,
  decodeInvoice,
  payInvoice,
};

export default lightning;
