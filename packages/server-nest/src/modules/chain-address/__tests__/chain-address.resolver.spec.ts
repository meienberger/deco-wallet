import { Test, TestingModule } from '@nestjs/testing';
import { ChainAddressResolver } from '../chain-address.resolver';

describe('ChainAddressResolver', () => {
  let resolver: ChainAddressResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChainAddressResolver],
    }).compile();

    resolver = module.get<ChainAddressResolver>(ChainAddressResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
