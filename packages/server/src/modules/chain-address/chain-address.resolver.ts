/* eslint-disable class-methods-use-this */
import { Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { isAuth } from '../../middlewares/isAuth';
import { MyContext } from '../../types';
import ChainAddressController from './chain-address.controller';
import ChainAddress from './chain-address.entity';

@Resolver(() => ChainAddress)
export class ChainAddressResolver {
  @UseMiddleware(isAuth)
  @Mutation(() => ChainAddress)
  getChainAddress(@Ctx() { req }: MyContext): Promise<ChainAddress> {
    if (req.session.userId) {
      return ChainAddressController.createChainAddress(req.session.userId);
    }

    throw new Error('User not logged in');
  }
}
