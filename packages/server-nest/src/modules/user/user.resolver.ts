import { Resolver, Query, Context } from '@nestjs/graphql';
import { MyContext } from '../../types';
import User from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User, { nullable: true })
  me(@Context() ctx: MyContext): Promise<User | null> {
    return this.userService.getUser(ctx.req.session.userId);
  }
}
