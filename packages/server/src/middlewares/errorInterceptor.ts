import { MiddlewareFn } from 'type-graphql';
import { FieldError } from '../utils/error.types';

// eslint-disable-next-line id-length
export const ErrorInterceptor: MiddlewareFn<any> = async (_, next): Promise<{ errors: FieldError[] }> => {
  try {
    return await next();
  } catch (error) {
    // write error to file log

    if (error instanceof Error) {
      return {
        errors: [{ field: error.name, message: error.message, code: Number(error.message) }],
      };
    }

    return { errors: [{ field: 'unknown', message: 'an unknow error occured', code: 500 }] };
  }
};
