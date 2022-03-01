/* eslint-disable max-statements */
import 'reflect-metadata';
import { createServer } from 'http';
import initialChecks from './services/checks';
import { ApolloServerLoaderPlugin } from 'type-graphql-dataloader';
import express from 'express';
import config from './config';
import logger from './config/logger';
import { ApolloServer } from 'apollo-server-express';
import { createConnection, getConnection } from 'typeorm';
import admin from 'firebase-admin';
import { MyContext } from './types';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { createSchema } from './utils/createSchema';
import getSessionMiddleware from './core/sessionMiddleware';
import getSubscriptionServer, { pubSub } from './core/subscriptionServer';
import { validateEmail } from './services/mail.service';

const serviceAccount = require('./config/firebase-adminsdk.json');

const main = async () => {
  try {
    await createConnection(config.typeorm);
    await initialChecks();

    // await sendConfirmEmail('nicolas.meienberger@icloud.com');

    const app = express();

    app.get('/confirm-email/:token', async (req, res) => {
      const { token } = req.params;

      const isValidated = await validateEmail(token);

      if (isValidated) {
        res.send('Your email has been validated! You can now login.');
      } else {
        res.send('There was an error validating your email. Please try again.');
      }
    });

    // Firebase
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

    const sessionMiddleware = await getSessionMiddleware();

    app.use(sessionMiddleware);

    const httpServer = createServer(app);
    const schema = await createSchema(pubSub);

    const subscriptionServer = getSubscriptionServer(schema, sessionMiddleware, httpServer);

    const apolloServer = new ApolloServer({
      schema,
      context: ({ req, res }): MyContext => ({ req, res }),
      plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground({ settings: { 'request.credentials': 'include' } }),
        {
          async serverWillStart() {
            await getConnection();

            return {
              async drainServer() {
                await subscriptionServer.close();
              },
            };
          },
        },
        ApolloServerLoaderPlugin({
          typeormGetConnection: getConnection,
        }),
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
