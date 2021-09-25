import LNDHubService from '../../services/lndhub.service';
import { IInvoice } from '../../services/lndhub.service.types';

interface IProps {
  baseUri: string;
}

class LightningWallet {
  lndhub: LNDHubService;

  accessToken = '';

  accessTokenCreated = 0;

  refreshToken = '';

  refreshTokenCreated = 0;

  secret = '';

  baseUri = '';

  balance = 0;

  refillAddresses: string[] = [];

  transactions: string[] = [];

  invoices: IInvoice[] = [];

  constructor(props: IProps) {
    this.lndhub = new LNDHubService({ baseUri: props.baseUri });
    this.baseUri = props.baseUri;
  }

  static fromJson(obj: { baseUri: string }): LightningWallet {
    const temp = new this({ baseUri: obj.baseUri });

    // eslint-disable-next-line no-loops/no-loops
    for (const key2 of Object.keys(obj)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore This kind of magic is not allowed in typescript, we should try and be more specific
      temp[key2] = obj[key2];
    }

    temp.init();

    return temp;
  }

  init(): void {
    this.lndhub = new LNDHubService({ baseUri: this.baseUri });
  }

  async createAccount(isTest?: boolean): Promise<void> {
    this.secret = await this.lndhub.createAccount(isTest);
  }

  /**
   * @returns the refill address or undefined if none is present
   */
  getAddress(): string | undefined {
    return this.refillAddresses.length > 0 ? this.refillAddresses[0] : undefined;
  }

  /**
   * Get new access tokens
   */
  async authorize(): Promise<void> {
    const { refreshToken, accessToken } = await this.lndhub.authorize(this.secret);

    this.accessTokenCreated = +Number(Date.now());
    this.refreshTokenCreated = +Number(Date.now());
    this.refreshToken = refreshToken;
    this.accessToken = accessToken;
  }

  async checkLogin(): Promise<void> {
    if (this.accessTokenExpired() && this.refreshTokenExpired()) {
      await this.authorize();
    }

    if (this.accessTokenExpired()) {
      let refreshedOk = true;

      try {
        await this.refreshAccessToken();
      } catch (error) {
        console.error(error);
        refreshedOk = false;
      }

      if (!refreshedOk) {
        await this.authorize();
      }
    }
  }

  /**
   * Generates a new refill address
   */
  async getNewAddress(): Promise<string> {
    await this.checkLogin();

    this.refillAddresses = await this.lndhub.fetchBtcAddress(this.accessToken);

    return this.refillAddresses[0];
  }

  accessTokenExpired(): boolean {
    return (+Number(Date.now()) - this.accessTokenCreated) / 1000 >= 3600 * 2;
  }

  refreshTokenExpired(): boolean {
    return (+Number(Date.now()) - this.refreshTokenCreated) / 1000 >= 3600 * 24 * 7;
  }

  async refreshAccessToken(): Promise<void> {
    const { refreshToken, accessToken } = await this.lndhub.refreshAcessToken(this.refreshToken);

    this.accessTokenCreated = +Number(Date.now());
    this.refreshTokenCreated = +Number(Date.now());
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  async createInvoice(amt: number, memo: string): Promise<string> {
    await this.checkLogin();

    return this.lndhub.addInvoice(amt, memo, this.accessToken);
  }

  async fetchBalance(): Promise<void> {
    await this.checkLogin();

    const { balance } = await this.lndhub.fetchBalance(this.accessToken);

    this.balance = balance;
  }

  getBalance(): number {
    return this.balance;
  }

  async getUserInvoices(): Promise<void> {
    this.checkLogin();

    const newInvoices = await this.lndhub.getUserInvoices(this.accessToken, this.invoices);

    this.invoices = newInvoices;
  }

  async fetchTransactions(): Promise<void> {
    this.checkLogin();

    const { transactionsRaw } = await this.lndhub.fetchTransactions(this.accessToken, 10, 0);

    this.transactions = transactionsRaw;
  }
}

export default LightningWallet;
