import { Module } from '@nestjs/common';
import { ChainAddressService } from './chain-address.service';
import { ChainAddressResolver } from './chain-address.resolver';

@Module({
  providers: [ChainAddressService, ChainAddressResolver],
})
export class ChainAddressModule {}
