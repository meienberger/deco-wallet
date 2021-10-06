import { MikroORM } from '@mikro-orm/core';
import microConfig from './mikro-orm.config';

(async () => {
  const orm = await MikroORM.init({ ...microConfig, host: 'localhost' });

  const migrator = orm.getMigrator();

  await migrator.createMigration();

  await orm.close(true);
})();
