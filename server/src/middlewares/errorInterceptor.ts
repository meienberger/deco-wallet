import { MiddlewareFn } from 'type-graphql';
import ERROR_CODES from '../config/constants/error.codes';
import logger from '../config/logger';
import { FieldError } from '../utils/error.types';

const handleLndError = (error: any): { errors: FieldError[] } => {
  const stack = error[2];

  if (stack?.err?.code && stack.err.code === 6) {
    return { errors: [{ field: 'lnd', message: stack.err.message, code: ERROR_CODES.invoice.alreadyPaid }] };
  }

  logger.error('Unknown error occured', JSON.stringify(error));

  return { errors: [{ field: 'unknown', message: JSON.stringify(error), code: 500 }] };
};

export const ErrorInterceptor: MiddlewareFn<any> = async (_, next): Promise<{ errors: FieldError[] }> => {
  try {
    return await next();
  } catch (error) {
    // write error to file log
    if (Array.isArray(error)) {
      return handleLndError(error);
    }

    if (error instanceof Error) {
      return {
        errors: [{ field: error.name, message: error.message, code: Number(error.message) }],
      };
    }

    return { errors: [{ field: 'unknown', message: 'an unknow error occured', code: 500 }] };
  }
};
