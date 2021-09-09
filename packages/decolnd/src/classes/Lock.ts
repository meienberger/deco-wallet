import { Redis } from 'ioredis';

class Lock {
  _lockKey: string;

  _redis: Redis;

  /**
   *
   * @param {Redis} redis
   * @param {String} lock_key
   */
  constructor(redis: Redis, lockKey: string) {
    this._redis = redis;
    this._lockKey = lockKey;
  }

  /**
   * Tries to obtain lock in single-threaded Redis.
   * Returns TRUE if success.
   *
   * @returns {Promise<boolean>}
   */
  async obtainLock(): Promise<boolean> {
    const timestamp = Date.now();

    const setResult = await this._redis.setnx(this._lockKey, timestamp);

    if (!setResult) {
      // it already held a value - failed locking
      return false;
    }

    // success - got lock
    await this._redis.expire(this._lockKey, 5 * 60);

    // lock expires in 5 mins just for any case
    return true;
  }

  async releaseLock(): Promise<void> {
    await this._redis.del(this._lockKey);
  }
}

export default Lock;
