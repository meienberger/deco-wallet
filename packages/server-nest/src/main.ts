import { NestFactory } from '@nestjs/core';
import admin from 'firebase-admin';
import { AppModule } from './app.module';
import logger from './config/logger';
import { sessionMiddleware } from './middlewares/session.middleware';
import './types';

const serviceAccount = require('./config/firebase-adminsdk.json');

const bootstrap = async () => {
  try {
    const app = await NestFactory.create(AppModule);

    // Firebase
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

    app.use(sessionMiddleware);

    await app.listen(3000);
  } catch (error) {
    logger.error(error);
  }
};

bootstrap();
