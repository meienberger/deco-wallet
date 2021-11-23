import logger from '../config/logger';
import { ErrorResponse } from './error.types';

const handleErrors = (error: unknown): ErrorResponse => {
  logger.error(error);

  if (error instanceof Error) {
    return {
      errors: [{ field: error.name, message: error.message, code: 500 }],
    };
  }

  return { errors: [{ field: 'unknown', message: 'an unknow error occured', code: 500 }] };
};

const ErrorHelpers = {
  handleErrors,
};

export default ErrorHelpers;
