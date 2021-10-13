/* eslint-disable class-methods-use-this */
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { User } from '../entities/User';
import ErrorHelpers from '../controllers/helpers/error-helpers';
import { MyContext } from '../types';
import UserController from '../controllers/user.controller';
import { UsernamePasswordInput, UserResponse } from './types/user.types';

@Resolver()
export default class UserResolver {
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext): Promise<User | null> {
    return UserController.getUser(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(@Arg('input') input: UsernamePasswordInput, @Ctx() { req }: MyContext): Promise<UserResponse> {
    try {
      const { errors, user } = await UserController.signup(input);

      if (user) {
        // eslint-disable-next-line no-param-reassign
        req.session.userId = user.id;
      }

      return { user, errors };
    } catch (error) {
      return ErrorHelpers.handleErrors(error);
    }
  }

  @Mutation(() => UserResponse)
  async login(@Arg('input') input: UsernamePasswordInput, @Ctx() { req }: MyContext): Promise<UserResponse> {
    try {
      const { errors, user } = await UserController.login(input);

      if (user) {
        // eslint-disable-next-line no-param-reassign
        req.session.userId = user.id;
      }

      return { user, errors };
    } catch (error) {
      return ErrorHelpers.handleErrors(error);
    }
  }
}
