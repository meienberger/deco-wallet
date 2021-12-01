/* eslint-disable class-methods-use-this */
import { Authorized, Ctx, Mutation, Resolver } from 'type-graphql';
import { MyContext } from '../../types';
import ChainAddressController from './chain-address.controller';
import ChainAddress from './chain-address.entity';

@Resolver(() => ChainAddress)
export class ChainAddressResolver {
  @Authorized()
  @Mutation(() => ChainAddress)
  getChainAddress(@Ctx() { req }: MyContext): Promise<ChainAddress> {
    return ChainAddressController.createChainAddress(req.session.userId || 0);
  }
}
