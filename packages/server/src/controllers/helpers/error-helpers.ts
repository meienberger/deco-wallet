import logger from '../../config/logger';
import { ErrorResponse } from '../../resolvers/types/error.types';

const handleErrors = (error: unknown): ErrorResponse => {
  logger.error(error);

  if (error instanceof Error) {
    return {
      errors: [{ field: error.name, message: error.message }],
    };
  }

  return { errors: [{ field: 'unknown', message: 'an unknow error occured' }] };
};

const ErrorHelpers = {
  handleErrors,
};

export default ErrorHelpers;
