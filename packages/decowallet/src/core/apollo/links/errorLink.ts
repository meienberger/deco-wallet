import { onError } from '@apollo/client/link/error';
import ErrorService from '../../deco/ErrorService';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  console.error(networkError, graphQLErrors);

  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`Error link [GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });

  if (networkError) {
    ErrorService.captureNetworkError(networkError);
    console.error(`Error link [Network error]: ${networkError}`);
  }
});

export default errorLink;
