import { Request, Response } from 'express';

declare module 'express' {
  interface Request {
    session: {
      userId?: number;
    };
  }
}

export type MyContext = {
  req: Request;
  res: Response;
};
