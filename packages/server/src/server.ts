import 'reflect-metadata';
import initialChecks from './core/checks';
import typeormConfig from './typeorm.config';
import express from 'express';
import config from './config';
import logger from './config/logger';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user';
import { createConnection } from 'typeorm';

initialChecks();

const main = async () => {
  await createConnection(typeormConfig);

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      validate: false,
    }),
    context: () => ({}),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  app.listen(config.appPort, () => {
    logger.info(`Server running on port ${config.appPort}`);
  });
};

main();
