"use strict";
exports.__esModule = true;
exports.PLATFORM_FEE = exports.ARGON_HASH_LENGTH = exports.COOKIE_MAX_AGE = exports.__prod__ = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
var __prod__ = process.env.NODE_ENV === 'production';
exports.__prod__ = __prod__;
// 10 years
var COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 365 * 10;
exports.COOKIE_MAX_AGE = COOKIE_MAX_AGE;
var ARGON_HASH_LENGTH = 66;
exports.ARGON_HASH_LENGTH = ARGON_HASH_LENGTH;
var PLATFORM_FEE = 100;
exports.PLATFORM_FEE = PLATFORM_FEE;
