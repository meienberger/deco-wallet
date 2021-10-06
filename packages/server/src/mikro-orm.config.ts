import path from 'path';
import config from './config';
import { __prod__ } from './config/constants';
import { User } from './entities/User';
import { Options } from '@mikro-orm/core';

const postgresql = 'postgresql' as const;

const mikroOrmConfig: Options = {
  entities: [User],
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d\.[jt]s$/u,
  },
  host: config.postgres.host,
  dbName: config.postgres.dbname,
  user: config.postgres.username,
  password: config.postgres.password,
  type: postgresql,
  debug: !__prod__,
};

export default mikroOrmConfig;
