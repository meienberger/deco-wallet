import { Test, TestingModule } from '@nestjs/testing';
import { ChainAddressService } from '../chain-address.service';

describe('ChainAddressService', () => {
  let service: ChainAddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChainAddressService],
    }).compile();

    service = module.get<ChainAddressService>(ChainAddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
