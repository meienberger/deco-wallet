import { MikroORM } from '@mikro-orm/core';
import initialChecks from './core/checks';
import { User } from './entities/User';
import microConfig from './mikro-orm.config';

initialChecks();

const main = async () => {
  const orm = await MikroORM.init(microConfig);

  await orm.getMigrator().up();

  // const user = orm.em.create(User, { username: 'Rico' });

  // await orm.em.persistAndFlush(user);

  // const users = await orm.em.find(User, {});

  // console.log(users);
};

main();
