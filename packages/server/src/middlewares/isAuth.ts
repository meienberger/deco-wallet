import { MiddlewareFn } from 'type-graphql';
import ERROR_CODES from '../config/constants/error.codes';
import { MyContext } from '../types';

const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error(ERROR_CODES.auth.notLoggedIn.toString());
  }

  return next();
};

export { isAuth };
