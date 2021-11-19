import { Resolver, Query, Context, Mutation, Args } from '@nestjs/graphql';
import { MyContext } from '../../types';
import ErrorHelpers from '../../utils/error-helpers';
import User from './user.entity';
import { UserService } from './user.service';
import { UsernamePasswordInput, UserResponse } from './user.types';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User, { nullable: true })
  me(@Context() ctx: MyContext): Promise<User | null> {
    return this.userService.getUser(ctx.req.session?.userId);
  }

  @Mutation(() => UserResponse)
  async login(@Args('input') input: UsernamePasswordInput, @Context() { req }: MyContext): Promise<UserResponse> {
    try {
      const { errors, user } = await this.userService.login(input);

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
  async register(@Args('input') input: UsernamePasswordInput, @Context() { req }: MyContext): Promise<UserResponse> {
    try {
      const { errors, user } = await this.userService.signup(input);

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
  async loginSocial(@Args('token') token: string, @Context() { req }: MyContext): Promise<UserResponse> {
    try {
      const { errors, user } = await this.userService.loginSocial({ token });

      if (user) {
        // eslint-disable-next-line no-param-reassign
        req.session.userId = user.id;
      }

      return { user, errors };
    } catch (error) {
      return ErrorHelpers.handleErrors(error);
    }
  }

  @Mutation(() => Boolean)
  logout(@Context() { req }: MyContext): boolean {
    // eslint-disable-next-line no-param-reassign
    req.session.userId = undefined;

    return true;
  }
}
