import { Redis } from 'ioredis';
import crypto from 'crypto';
import Lock from './Lock';
import config from '../config';
import jayson from 'jayson/promise';
import { ILightning } from '../db/lightning';

const hash = (string: string) => {
  return crypto.createHash('sha256').update(string).digest().toString('hex');
};

class User {
  _redis: Redis;

  _bitcoindrpc: jayson.Client;

  _lightning: ILightning;

  _login = '';

  _password = '';

  _userid = '';

  constructor(redis: Redis, bitcoinrpc: jayson.Client, lightning: ILightning) {
    this._redis = redis;
    this._bitcoindrpc = bitcoinrpc;
    this._lightning = lightning;
  }

  async create(): Promise<void> {
    let buffer = crypto.randomBytes(10);

    const login = buffer.toString('hex');

    buffer = crypto.randomBytes(10);

    const password = buffer.toString('hex');

    buffer = crypto.randomBytes(24);

    const userid = buffer.toString('hex');

    this._login = login;
    this._password = password;
    this._userid = userid;
    await this._saveUserToDatabase();
  }

  async _saveUserToDatabase(): Promise<void> {
    const key = `user_${this._login}_${hash(this._password)}`;

    await this._redis.set(key, this._userid);
  }

  async addAddress(address: string): Promise<void> {
    await this._redis.set(`bitcoin_address_for_${this._userid}`, address);
  }

  async generateAddress(): Promise<string> {
    const lock = new Lock(this._redis, `generating_address_${this._userid}`);

    if (!(await lock.obtainLock())) {
      // someone's already generating address retry
      await this.generateAddress();
    }

    return new Promise((resolve, reject) => {
      this._lightning.newAddress({ type: 0 }, async (err: Error, response: { address: string }) => {
        if (err) return reject(new Error('LND failure when trying to generate new address'));

        await this.addAddress(response.address);

        if (config.bitcoind) this._bitcoindrpc.request('importaddress', [response.address, response.address, false]);

        return resolve(response.address);
      });
    });
  }

  async getAddress(): Promise<string> {
    let addr = await this._redis.get(`bitcoin_address_for_${this._userid}`);

    if (!addr) {
      addr = await this.generateAddress();
    }

    if (!addr) throw new Error('cannot get transactions: no onchain address assigned to user');

    return addr;
  }

  //   async getPendingTxs() {
  //     const addr = await this.getAddress();

  //     let txs = await this._listtransactions();
  //     txs = txs.result;
  //     let result = [];
  //     for (let tx of txs) {
  //       if (tx.confirmations < 3 && tx.address === addr && tx.category === 'receive') {
  //         result.push(tx);
  //       }
  //     }
  //     return result;
  //   }
}

export default User;
