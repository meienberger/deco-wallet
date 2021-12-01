import { ApolloClient, from } from '@apollo/client';
import { createApolloCache } from './cache';
import links from './links';

export const createApolloClient = async (): Promise<ApolloClient<unknown>> => {
  const cache = await createApolloCache();

  const additiveLink = from([links.errorLink, links.httpLink]);

  return new ApolloClient({
    link: additiveLink,
    cache,
    credentials: 'include',
  });
};
