import { buildSchema } from 'type-graphql';
import { GraphQLSchema } from 'graphql';
import UserResolver from '../modules/user/user.resolver';
import InvoiceResolver from '../modules/invoice/invoice.resolver';
import { ChainAddressResolver } from '../modules/chain-address/chain-address.resolver';

export const createSchema = (): Promise<GraphQLSchema> =>
  buildSchema({
    resolvers: [UserResolver, InvoiceResolver, ChainAddressResolver],
    validate: false,
  });
