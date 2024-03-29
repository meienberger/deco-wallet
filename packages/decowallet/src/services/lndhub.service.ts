import axios, { AxiosResponse } from 'axios';

import { IInvoice } from './lndhub.service.types';

const handleApiErrors = (response: AxiosResponse) => {
  if (typeof response.data === 'undefined') {
    throw new TypeError(`API failure: ${response.status} ${JSON.stringify(response.data)}`);
  }

  if (response.data && response.data.error) {
    throw new Error(`API error: (${response.data.message ? response.data.message : response.data.error}) (code ${response.data.code})`);
  }
};

const jsonContentType = 'application/json';

const api = axios.create({
  baseURL: 'http://192.168.1.111:3008/',
  headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': jsonContentType },
});

/**
 * Creates a new account on the lndhub instance
 * @param isTest is it a test account
 * @returns connexion string
 */
const createAccount = async (isTest?: boolean): Promise<string> => {
  const response = await api.post('/create', {
    partnerid: 'bluewallet',
    accounttype: isTest ? 'test' : 'common',
  });

  handleApiErrors(response);

  const json = response.data;

  if (!response.data.login || !response.data.password) {
    throw new Error(`API unexpected response: ${JSON.stringify(response.data)}`);
  }

  return `lndhub://${json.login}:${json.password}`;
};

/**
 * Uses login & pass stored in `this.secret` to authorize
 * and set internal `access_token` & `refresh_token`
 *
 * @return {Promise.<void>}
 */
const authorize = async (
  secret: string,
): Promise<{
  refreshToken: string;
  accessToken: string;
}> => {
  const [login, password] = secret.replace('lndhub://', '').split(':');

  const response = await api.post('/auth', {
    login,
    password,
  });

  handleApiErrors(response);

  const json = response.data;

  return {
    refreshToken: json.refresh_token,
    accessToken: json.access_token,
  };
};

const refreshAcessToken = async (
  refreshToken: string,
): Promise<{
  refreshToken: string;
  accessToken: string;
}> => {
  const response = await api.post('/auth?type=refresh_token', {
    body: { refresh_token: refreshToken },
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': jsonContentType },
  });

  handleApiErrors(response);

  const json = response.data;

  if (!json.access_token || !json.refresh_token) {
    throw new Error(`API unexpected response: ${JSON.stringify(response.data)}`);
  }

  return {
    refreshToken: json.refresh_token,
    accessToken: json.access_token,
  };
};

/**
 * Generates a new refill address
 * @param accessToken
 * @returns array of addresses
 */
const getBtcAddresses = async (accessToken: string): Promise<string[]> => {
  const response = await api.get<{ address: string }[]>('/getbtc', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': jsonContentType,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  handleApiErrors(response);

  const json = response.data;

  const refillAddresses: string[] = [];

  json.forEach((arr: { address: string }) => {
    refillAddresses.push(arr.address);
  });

  return refillAddresses;
};

const createInvoice = async (amt: number, memo: string, accessToken: string): Promise<string> => {
  const response = await api.post('/addinvoice', { amt: amt.toString(), memo }, { headers: { Authorization: `Bearer ${accessToken}` } });

  handleApiErrors(response);

  const json = response.data;

  if (!json.r_hash || !json.pay_req) {
    throw new Error(`API unexpected response: ${JSON.stringify(response.data)}`);
  }

  return json.pay_req;
};

const fetchBalance = async (
  accessToken: string,
): Promise<{
  balanceRaw: unknown;
  balance: number;
}> => {
  const response = await api.get('/balance', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  handleApiErrors(response);

  const json = response.data;

  if (!json.BTC || typeof json.BTC.AvailableBalance === 'undefined') {
    throw new Error(`API unexpected response: ${JSON.stringify(json)}`);
  }

  return {
    balanceRaw: json,
    balance: json.BTC.AvailableBalance,
  };
};

const fetchTransactions = async (
  accessToken: string,
  limit: number,
  offset: number,
): Promise<{
  transactionsRaw: string[];
}> => {
  let queryRes = '';

  queryRes += `?limit=${limit}`;
  queryRes += `&offset=${offset}`;

  const response = await api.get(`/gettxs${queryRes}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  handleApiErrors(response);

  if (!Array.isArray(response.data)) {
    throw new TypeError(`API unexpected response:  ${JSON.stringify(response.data)}`);
  }

  return {
    transactionsRaw: response.data,
  };
};

const fetchPendingTransactions = async (
  accessToken: string,
): Promise<{
  transactionsPending: string[];
}> => {
  const response = await api.get('/getpending', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  handleApiErrors(response);

  return {
    transactionsPending: response.data,
  };
};

const getUserInvoices = async (accessToken: string, oldInvoices: IInvoice[]): Promise<IInvoice[]> => {
  const response = await api.get('/getuserinvoices', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const invoices: IInvoice[] = response.data;

  handleApiErrors(response);

  oldInvoices.forEach(oldInvoice => {
    // iterate all OLD invoices
    let found = false;

    response.data.forEach((newInvoice: IInvoice) => {
      if (newInvoice.payment_request === oldInvoice.payment_request) found = true;
    });

    if (!found) {
      // if old invoice is not found in NEW array, we simply add it:
      invoices.push(oldInvoice);
    }
  });

  // eslint-disable-next-line id-length
  return invoices.sort((a, b) => b.timestamp - a.timestamp);
};

const payInvoice = async (accessToken: string, invoice: string, amount: number): Promise<void> => {
  const response = await api.post(
    '/payinvoice',
    { invoice, amount },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  handleApiErrors(response);
};

const LNDHubService = {
  createAccount,
  refreshAcessToken,
  fetchBalance,
  fetchTransactions,
  payInvoice,
  getUserInvoices,
  fetchPendingTransactions,
  createInvoice,
  getBtcAddresses,
  authorize,
};

export default LNDHubService;
