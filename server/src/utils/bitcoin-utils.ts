import { bitcoin } from '../services';

const isAddressOwner = async (address: string, userId: number): Promise<boolean> => {
  const res = await bitcoin.getAddressInfo(address);

  if (res && res.ismine && res.labels.includes(userId.toString())) {
    return true;
  }

  return false;
};

export { isAddressOwner };
