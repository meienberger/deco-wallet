/* eslint-disable camelcase */

enum InvoiceTypesEnum {
  user_invoice = 'user_invoice',
}

interface IInvoice {
  add_index: string;
  amt: number;
  description: string;
  expire_time: number;
  ispaid: boolean;
  pay_req: string;
  payment_hash: string;
  payment_request: string;
  timestamp: number;
  type: InvoiceTypesEnum;
}

export { IInvoice, InvoiceTypesEnum };
