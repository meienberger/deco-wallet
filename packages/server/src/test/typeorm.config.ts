import { createConnection } from 'typeorm';
import { ENTITIES } from '../entities';

const config: Parameters<typeof createConnection>[0] = {
  name: 'default',
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'tests',
  dropSchema: true,
  logging: false,
  synchronize: true,
  entities: ENTITIES,
};

export default config;
