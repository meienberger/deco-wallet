import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { ErrorResponse } from '../../types/error.types';
import User from './user.entity';

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
