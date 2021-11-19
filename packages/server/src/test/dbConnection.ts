// import { forEachSeries } from 'p-iteration';
import { createConnection, getConnection } from 'typeorm';
import typeormConfig from './typeorm.config';

const connection = {
  async create(): Promise<void> {
    await createConnection(typeormConfig);
  },
  async close(): Promise<void> {
    await getConnection().close();
  },

  async clear(): Promise<void> {
    const conn = getConnection();

    await conn.dropDatabase();
    await conn.synchronize();
  },
};

export default connection;
