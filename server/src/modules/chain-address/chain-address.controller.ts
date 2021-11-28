import { bitcoin } from '../../services';
import UserController from '../user/user.controller';
import ChainAddress from './chain-address.entity';

const createChainAddress = async (userId: number): Promise<ChainAddress> => {
  let chainAddress = await ChainAddress.findOne({ where: { userId } });

  // Create one
  if (!chainAddress) {
    const address = await bitcoin.createNewAddress(userId);
    chainAddress = await ChainAddress.create({ address, userId }).save();
  }

  await UserController.addChainAddress(userId, chainAddress);

  return chainAddress;
};

const ChainAddressController = {
  createChainAddress,
};

export default ChainAddressController;
