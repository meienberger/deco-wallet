// General

// Auth 1xxx
const AUTH_EMAIL_ALREADY_EXISTS = 1001;
const AUTH_USER_NOT_FOUND = 1002;
const AUTH_INVALID_PASSWORD = 1003;
const AUTH_USER_DISABLED = 1004;
const AUTH_INVALID_TOKEN = 1005;
const AUTH_EMAIL_BADLY_FORMATTED = 1006;
const AUTH_PASSWORD_TOO_SHORT = 1007;
const AUTH_NOT_LOGGED_IN = 1008;

// Invoice 2xxx
const INVOICE_NOT_FOUND = 2001;
const INVOICE_AMOUNT_TOO_LOW = 2002;
const INVOICE_DESCRIPTION_TOO_LONG = 2003;
const INVOICE_NOT_OWNER = 2004;

// Common 3xxx
const INVALID_PAGINATION_PARAMS = 3001;

const ERROR_CODES = {
  auth: {
    emailAlreadyExists: AUTH_EMAIL_ALREADY_EXISTS,
    userNotFound: AUTH_USER_NOT_FOUND,
    invalidPassword: AUTH_INVALID_PASSWORD,
    userDisabled: AUTH_USER_DISABLED,
    invalidToken: AUTH_INVALID_TOKEN,
    emailBadlyFormatted: AUTH_EMAIL_BADLY_FORMATTED,
    passwordTooShort: AUTH_PASSWORD_TOO_SHORT,
    notLoggedIn: AUTH_NOT_LOGGED_IN,
  },
  invoice: {
    notFound: INVOICE_NOT_FOUND,
    amountTooLow: INVOICE_AMOUNT_TOO_LOW,
    descriptionTooLong: INVOICE_DESCRIPTION_TOO_LONG,
    notOwner: INVOICE_NOT_OWNER,
  },
  common: {
    invalidPaginationParams: INVALID_PAGINATION_PARAMS,
  },
};

export default ERROR_CODES;
