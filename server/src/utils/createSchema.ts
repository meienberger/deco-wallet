import { buildSchema } from 'type-graphql';
import { GraphQLSchema } from 'graphql';
import UserResolver from '../modules/user/user.resolver';
import InvoiceResolver from '../modules/invoice/invoice.resolver';
import { ChainAddressResolver } from '../modules/chain-address/chain-address.resolver';
import { ErrorInterceptor } from '../middlewares/errorInterceptor';
import { customAuthChecker } from '../middlewares/authChecker';
import { RedisPubSub } from 'graphql-redis-subscriptions';

export const createSchema = (pubSub?: RedisPubSub): Promise<GraphQLSchema> =>
  buildSchema({
    resolvers: [UserResolver, InvoiceResolver, ChainAddressResolver],
    validate: true,
    authChecker: customAuthChecker,
    globalMiddlewares: [ErrorInterceptor],
    pubSub,
  });