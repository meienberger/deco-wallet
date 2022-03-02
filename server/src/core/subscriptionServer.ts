import { GraphQLSchema, execute, subscribe } from 'graphql';
import Redis from 'ioredis';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { Server } from 'http';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import config from '../config';

// configure Redis connection options
const options: Redis.RedisOptions = {
  host: config.REDIS_IP,
  port: config.REDIS_PORT,
  retryStrategy: times => Math.max(times * 100, 3000),
};

const getSubscriptionServer = (schema: GraphQLSchema, sessionMiddleware: any, httpServer: Server): SubscriptionServer =>
  SubscriptionServer.create(
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

// create Redis-based pub-sub
export const pubSub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});

export default getSubscriptionServer;
