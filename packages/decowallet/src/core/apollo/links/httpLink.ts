import { HttpLink } from '@apollo/client';

// TODO: Temp, should use config from .env
const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql',
});

export default httpLink;
