/* eslint-disable class-methods-use-this */
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import User from './user.entity';
import { MyContext } from '../../types';
import UserController from './user.controller';
import { UsernamePasswordInput, UserResponse } from './user.types';

@Resolver()
export default class UserResolver {
  @Query(() => User, { nullable: true })
  me(@Ctx() ctx: MyContext): Promise<User | null> {
    return UserController.getUser(ctx.req.session.userId);
  }

  @Authorized()
  @Query(() => Number, { nullable: false })
  balance(@Ctx() { req }: MyContext): Promise<number> {
    return UserController.getBalance(req.session.userId || 0);
  }

  @Mutation(() => UserResponse)
  async register(@Arg('input') input: UsernamePasswordInput, @Ctx() { req }: MyContext): Promise<UserResponse> {
    const { errors, user } = await UserController.signup(input);

    if (user) {
      // eslint-disable-next-line no-param-reassign
      req.session.userId = user.id;
    }

    return { user, errors };
  }

  @Mutation(() => UserResponse)
  async login(@Arg('input') input: UsernamePasswordInput, @Ctx() { req }: MyContext): Promise<UserResponse> {
    const { errors, user } = await UserController.login(input);

    if (user) {
      // eslint-disable-next-line no-param-reassign
      req.session.userId = user.id;
    }

    return { user, errors };
  }

  @Mutation(() => UserResponse)
  async loginSocial(@Arg('token') token: string, @Ctx() { req }: MyContext): Promise<UserResponse> {
    const { errors, user } = await UserController.loginSocial({ token });

    if (user) {
      // eslint-disable-next-line no-param-reassign
      req.session.userId = user.id;
    }

    return { user, errors };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req }: MyContext): boolean {
    // eslint-disable-next-line no-param-reassign
    req.session.userId = undefined;

    return true;
  }
}
