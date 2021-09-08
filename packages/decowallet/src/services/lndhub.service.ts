import axios, { AxiosInstance, AxiosResponse } from 'axios';

const handleApiErrors = (response: AxiosResponse) => {
  if (typeof response.data === 'undefined') {
    throw new TypeError(`API failure: ${response.status} ${JSON.stringify(response.data)}`);
  }

  if (response.data && response.data.error) {
    throw new Error(`API error: (${response.data.message ? response.data.message : response.data.error}) (code ${response.data.code})`);
  }
};

const jsonContentType = 'application/json';

interface IProps {
  baseUri: string;
}

class LNDHubService {
  _api: AxiosInstance = axios.create();

  baseURI = '';

  constructor(props: IProps) {
    this.setBaseURI(props.baseUri);
    this.init();
  }

  init(): void {
    this._api = axios.create({
      baseURL: this.baseURI,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': jsonContentType },
    });
  }

  setBaseURI(URI: string): void {
    this.baseURI = URI;
  }

  /**
   * Creates a new account on the lndhub instance
   * @param isTest is it a test account
   * @returns connexion string
   */
  async createAccount(isTest?: boolean): Promise<string> {
    const response = await this._api.post('/create', {
      partnerid: 'bluewallet',
      accounttype: isTest ? 'test' : 'common',
    });

    handleApiErrors(response);

    const json = response.data;

    if (!response.data.login || !response.data.password) {
      throw new Error(`API unexpected response: ${JSON.stringify(response.data)}`);
    }

    return `lndhub://${json.login}:${json.password}`;
  }

  /**
   * Uses login & pass stored in `this.secret` to authorize
   * and set internal `access_token` & `refresh_token`
   *
   * @return {Promise.<void>}
   */
  async authorize(secret: string): Promise<{
    refreshToken: string;
    accessToken: string;
  }> {
    const login = secret.replace('lndhub://', '').split(':')[0];
    const password = secret.replace('lndhub://', '').split(':')[1];

    const response = await this._api.post('/auth', {
      login,
      password,
    });

    handleApiErrors(response);

    const json = response.data;

    return {
      refreshToken: json.refresh_token,
      accessToken: json.access_token,
    };
  }

  async refreshAcessToken(refreshToken: string): Promise<{
    refreshToken: string;
    accessToken: string;
  }> {
    const response = await this._api.post('/auth?type=refresh_token', {
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
  }

  /**
   * Generates a new refill address
   * @param accessToken
   * @returns array of addresses
   */
  async fetchBtcAddress(accessToken: string): Promise<string[]> {
    const response = await this._api.get<{ address: string }[]>('/getbtc', {
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
  }

  async addInvoice(amt: number, memo: string, accessToken: string): Promise<string> {
    const response = await this._api.post('/addinvoice', { amt: amt.toString(), memo }, { headers: { Authorization: `Bearer ${accessToken}` } });

    handleApiErrors(response);

    const json = response.data;

    if (!json.r_hash || !json.pay_req) {
      throw new Error(`API unexpected response: ${JSON.stringify(response.data)}`);
    }

    return json.pay_req;
  }

  async fetchBalance(accessToken: string): Promise<{
    balanceRaw: unknown;
    balance: number;
  }> {
    const response = await this._api.get('/balance', {
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
  }

  async fetchTransactions(
    accessToken: string,
    limit: number,
    offset: number,
  ): Promise<{
    transactionsRaw: string[];
  }> {
    let queryRes = '';

    queryRes += `?limit=${limit}`;
    queryRes += `&offset=${offset}`;

    const response = await this._api.get(`/gettxs${queryRes}`, {
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
  }
}

export default LNDHubService;
