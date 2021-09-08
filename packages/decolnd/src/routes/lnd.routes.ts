/* eslint-disable id-length */
import express from 'express';

const router = express.Router();

router.get('/test', (_, res) => {
  res.json({ hello: 'deco' });
});

export default router;
