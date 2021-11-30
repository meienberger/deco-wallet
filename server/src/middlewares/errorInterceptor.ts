/* eslint-disable max-statements */
import { MiddlewareFn } from 'type-graphql';
import ERROR_CODES from '../config/constants/error.codes';
import logger from '../config/logger';
import { FieldError } from '../utils/error.types';

const handleLndError = (error: any): { errors: FieldError[] } | null => {
  if (error?.err?.code && error.err.code === 6) {
    return { errors: [{ field: 'lnd', message: error.err.message, code: ERROR_CODES.invoice.alreadyPaid }] };
  }

  return null;
};

export const ErrorInterceptor: MiddlewareFn<any> = async (_, next): Promise<{ errors: FieldError[] }> => {
  try {
    return await next();
  } catch (error) {
    // write error to file log
    if (Array.isArray(error)) {
      const stack = error[2];

      const lndError = handleLndError(stack);

      if (stack?.err) {
        logger.error({ message: stack?.err });
      }

      if (lndError) {
        return lndError;
      }
    }

    if (error instanceof Error) {
      return {
        errors: [{ field: error.name, message: error.message, code: Number(error.message) }],
      };
    }

    return { errors: [{ field: 'unknown', message: 'an unknow error occured', code: 500 }] };
  }
};
