/* eslint-disable @typescript-eslint/naming-convention */
const __prod__ = process.env.NODE_ENV === 'production';

// 10 years
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 365 * 10;
const ARGON_HASH_LENGTH = 66;

export { __prod__, COOKIE_MAX_AGE, ARGON_HASH_LENGTH };
