/* eslint-disable max-statements */
import 'reflect-metadata';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import initialChecks from './services/checks';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import express from 'express';
import config from './config';
import logger from './config/logger';
import { ApolloServer } from 'apollo-server-express';
import { createConnection } from 'typeorm';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import admin from 'firebase-admin';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { COOKIE_MAX_AGE, __prod__ } from './config/constants/constants';
import { MyContext } from './types';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { createSchema } from './utils/createSchema';

const serviceAccount = require('./config/firebase-adminsdk.json');

const RedisStore = connectRedis(session);
const redisClient = redis.createClient(config.redis);

// configure Redis connection options
const options: Redis.RedisOptions = {
  host: config.redis.host,
  port: config.redis.port,
  retryStrategy: times => Math.max(times * 100, 3000),
};

// create Redis-based pub-sub
const pubSub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});

const main = async () => {
  try {
    await createConnection(config.typeorm);
    await initialChecks();

    const app = express();

    // Firebase
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

    const sessionMiddleware = session({
      name: 'qid',
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: { maxAge: COOKIE_MAX_AGE, secure: __prod__, sameSite: 'lax', httpOnly: true },
      secret: config.COOKIE_SECRET,
      resave: false,
      saveUninitialized: false,
    });

    app.use(sessionMiddleware);

    const httpServer = createServer(app);
    const schema = await createSchema(pubSub);
    const subscriptionServer = SubscriptionServer.create(
      {
        schema,
        execute,
        subscribe,
        onConnect: async (_: any, ws: any) => {
          const params: any = {};

          const promise = new Promise(resolve => {
            sessionMiddleware(ws.upgradeReq, params, () => {
              resolve(ws.upgradeReq.session.userId);
            });
          });

          const userId = await promise;

          return { req: { session: { userId } } };
        },
      },
      { server: httpServer, path: '/graphql' },
    );

    const apolloServer = new ApolloServer({
      schema,
      context: ({ req, res }): MyContext => ({ req, res }),
      plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground({ settings: { 'request.credentials': 'include' } }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                subscriptionServer.close();
              },
            };
          },
        },
      ],
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

    httpServer.listen(config.APP_PORT, () => {
      logger.info(`Server running on port ${config.APP_PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

main();

export { pubSub };
