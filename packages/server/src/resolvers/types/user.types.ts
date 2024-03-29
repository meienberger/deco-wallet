/* eslint-disable max-classes-per-file */
import { ObjectType, Field, InputType } from 'type-graphql';
import User from '../../entities/User';
import { ErrorResponse } from './error.types';

@ObjectType()
class UserResponse extends ErrorResponse {
  @Field(() => User, { nullable: true })
  user?: User;
}

@InputType()
class UsernamePasswordInput {
  @Field()
  username!: string;

  @Field()
  password!: string;
}

export { UserResponse, UsernamePasswordInput };
