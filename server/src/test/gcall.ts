import { graphql, GraphQLSchema } from 'graphql';
import { Maybe } from 'type-graphql';
import { createSchema } from '../utils/createSchema';

interface Options {
  source: string;
  variableValues?: Maybe<{
    [key: string]: any;
  }>;
  userId?: number;
}

let schema: GraphQLSchema | null = null;

export const gcall = async ({ source, variableValues, userId }: Options) => {
  if (!schema) {
    // eslint-disable-next-line require-atomic-updates
    schema = await createSchema();
  }

  return graphql({
    schema,
    source,
    variableValues,
    contextValue: { req: { session: { userId } } },
  });
};
