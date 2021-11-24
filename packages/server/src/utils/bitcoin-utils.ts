import argon2 from 'argon2';
import { bitcoin } from '../services';

const isAddressOwner = async (address: string, userId: number): Promise<boolean> => {
  const res = await bitcoin.getAddressInfo(address);

  const hashedUserId = await argon2.hash(userId.toString(), { hashLength: 10 });

  if (res && res.ismine && res.labels.includes(hashedUserId)) {
    return true;
  }

  return false;
};

export { isAddressOwner };
