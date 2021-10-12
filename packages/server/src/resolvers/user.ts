/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { Arg, Field, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import argon2 from 'argon2';
import { User } from '../entities/User';
import ErrorHelpers, { ErrorResponse } from './helpers/error-helpers';
import UserHelpers, { UsernamePasswordInput } from './helpers/user-helpers';

@ObjectType()
class UserResponse extends ErrorResponse {
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  user(@Arg('id') id: number): Promise<User | undefined> {
    return User.findOne(id);
  }

  @Mutation(() => UserResponse)
  async register(@Arg('input') input: UsernamePasswordInput): Promise<UserResponse> {
    const { username, password } = input;

    try {
      const hash = await argon2.hash(password);
      const errors = UserHelpers.validateUsernamePassword(input);

      if (errors.length > 0) {
        return { errors };
      }

      const user = await User.create({ username: UserHelpers.formatUsername(username), password: hash }).save();

      return { user };
    } catch (error) {
      return ErrorHelpers.handleErrors(error);
    }
  }

  @Mutation(() => UserResponse)
  async login(@Arg('input') input: UsernamePasswordInput): Promise<UserResponse> {
    const { username, password } = input;

    try {
      const user = await User.findOne({ where: { username: UserHelpers.formatUsername(username) } });

      if (!user) {
        return { errors: [{ field: 'username', message: 'No user found for that email' }] };
      }

      const isPasswordValid = await argon2.verify(user.password, password);

      if (!isPasswordValid) {
        return { errors: [{ field: 'password', message: 'Incorrect password' }] };
      }

      return { user };
    } catch (error) {
      return ErrorHelpers.handleErrors(error);
    }
  }
}
