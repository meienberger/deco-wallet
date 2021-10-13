/* eslint-disable max-classes-per-file */
import { Field, ObjectType } from 'type-graphql';
import logger from '../../config/logger';

@ObjectType()
class FieldError {
  @Field()
  field!: string;

  @Field()
  message!: string;
}

@ObjectType()
class ErrorResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

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

export { ErrorResponse, FieldError };
export default ErrorHelpers;
