import connectRedis from 'connect-redis';
import redis from 'redis';
import session from 'express-session';
import config from '../config';
import { COOKIE_MAX_AGE, __prod__ } from '../config/constants';

const RedisStore = connectRedis(session);
const redisClient = redis.createClient(config.redis);

export const sessionMiddleware = session({
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
