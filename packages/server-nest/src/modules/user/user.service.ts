import { Injectable } from '@nestjs/common';
import User from './user.entity';

@Injectable()
export class UserService {
  /**
   * Find user based on userId
   * @param userId
   * @returns User
   */
  async getUser(userId?: number): Promise<User | null> {
    if (!userId) {
      return null;
    }

    const user = await User.findOne({ where: { id: userId } });

    return user || null;
  }
}
