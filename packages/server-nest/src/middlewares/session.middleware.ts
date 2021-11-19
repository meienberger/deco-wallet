import connectRedis from 'connect-redis';
import redis from 'redis';
import session from 'express-session';
import { NextFunction, Request, Response } from 'express';
import config from '../config';
import { COOKIE_MAX_AGE, __prod__ } from '../config/constants';

export const sessionMiddleware = (_1: Request, _2: Response, next: NextFunction): void => {
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient(config.redis);

  session({
    name: 'qid',
    store: new RedisStore({ client: redisClient, disableTouch: true }),
    cookie: {
      maxAge: COOKIE_MAX_AGE,
      secure: __prod__,
      sameSite: 'lax',
      httpOnly: true,
    },
    secret: config.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
  });

  next();
};
