/* eslint-disable max-classes-per-file */
import { ObjectType, Field } from 'type-graphql';

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

export { FieldError, ErrorResponse };
