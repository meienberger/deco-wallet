import { bitcoin } from '../../services';
import ChainAddress from './chain-address.entity';

const createChainAddress = async (userId: number): Promise<ChainAddress> => {
  const address = await bitcoin.createNewAddress(userId);

  return ChainAddress.create({ address, userId }).save();
};

const ChainAddressController = {
  createChainAddress,
};

export default ChainAddressController;
