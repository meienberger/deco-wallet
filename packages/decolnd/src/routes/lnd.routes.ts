import express from 'express';
import lndController from '../controllers/lnd.controller';

const router = express.Router();

router.get('/test', lndController.createWallet);

export default router;
