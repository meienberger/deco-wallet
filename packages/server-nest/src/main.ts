import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { sessionMiddleware } from './middlewares/session.middleware';
import './types';

const bootstrap = async () => {
  try {
    const app = await NestFactory.create(AppModule);

    app.use(sessionMiddleware);
    await app.listen(3000);
  } catch (error) {
    console.error(error);
  }
};

bootstrap();
