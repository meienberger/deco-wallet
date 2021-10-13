import lnService from 'lightning';
import config from '../config';
import { formatISO, addHours } from 'date-fns';

interface IInvoiceInput {
  description: string;
  amount: number;
}

const { lnd } = lnService.authenticatedLndGrpc(config.lnd);

const getWalletInfo = (): Promise<lnService.GetWalletInfoResult> => {
  return lnService.getWalletInfo({ lnd });
};

const createInvoice = (input: IInvoiceInput): Promise<lnService.CreateInvoiceResult> => {
  const { description, amount } = input;

  const expirationDate = addHours(new Date(), 1);

  return lnService.createInvoice({ lnd, description, tokens: amount, expires_at: formatISO(expirationDate) });
};

const getInvoice = (invoiceId: string): Promise<lnService.GetInvoiceResult> => {
  return lnService.getInvoice({ lnd, id: invoiceId });
};

const lightning = {
  getWalletInfo,
  getInvoice,
  createInvoice,
};

export default lightning;
