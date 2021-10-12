import { createConnection } from 'typeorm';
import config from './config';
import { __prod__ } from './config/constants';
import { User } from './entities/User';

const typeormConfig = {
  type: 'postgres',
  host: config.postgres.host,
  database: config.postgres.dbname,
  username: config.postgres.username,
  password: config.postgres.password,
  logging: !__prod__,
  synchronize: true,
  entities: [User],
} as Parameters<typeof createConnection>[0];

export default typeormConfig;
