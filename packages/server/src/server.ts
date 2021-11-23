/* eslint-disable max-statements */
import 'reflect-metadata';
import initialChecks from './services/checks';
import express from 'express';
import config from './config';
import logger from './config/logger';
import { ApolloServer } from 'apollo-server-express';
import { createConnection } from 'typeorm';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import admin from 'firebase-admin';
import { COOKIE_MAX_AGE, __prod__ } from './config/constants/constants';
import { MyContext } from './types';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { createSchema } from './utils/createSchema';

const serviceAccount = require('./config/firebase-adminsdk.json');

const RedisStore = connectRedis(session);

const redisClient = redis.createClient(config.redis);

const main = async () => {
  try {
    await createConnection(config.typeorm);
    await initialChecks();

    const app = express();

    // Firebase
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

    app.use(
      session({
        name: 'qid',
        store: new RedisStore({ client: redisClient, disableTouch: true }),
        cookie: { maxAge: COOKIE_MAX_AGE, secure: __prod__, sameSite: 'lax', httpOnly: true },
        secret: config.COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
      }),
    );

    const apolloServer = new ApolloServer({
      schema: await createSchema(),
      context: ({ req, res }): MyContext => ({ req, res }),
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app });

    app.listen(config.APP_PORT, () => {
      logger.info(`Server running on port ${config.APP_PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

main();
