import { Request, Response } from 'express';

const createWallet = (_: Request, res: Response) => {
  res.send({ hello: 'deco' });
};

const controller = {
  createWallet,
};

export default controller;
