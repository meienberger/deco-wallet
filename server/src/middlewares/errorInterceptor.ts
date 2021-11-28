/* eslint-disable id-length */
import { MiddlewareFn } from 'type-graphql';
import logger from '../config/logger';
import { FieldError } from '../utils/error.types';

export const ErrorInterceptor: MiddlewareFn<any> = async (_, next): Promise<{ errors: FieldError[] }> => {
  try {
    return await next();
  } catch (error) {
    // write error to file log
    if (Array.isArray(error)) {
      const stack = error[2];

      logger.error({ message: stack?.err });
    }

    if (error instanceof Error) {
      return {
        errors: [{ field: error.name, message: error.message, code: Number(error.message) }],
      };
    }

    return { errors: [{ field: 'unknown', message: 'an unknow error occured', code: 500 }] };
  }
};
