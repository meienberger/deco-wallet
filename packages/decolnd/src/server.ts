import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { Logger } from './config';
import lndRoutes from './routes/lnd.routes';
import initialChecks from './core/checks';

initialChecks();

const app = express();

app.enable('trust proxy');
app.use(helmet.hsts());
app.use(helmet.hidePoweredBy());

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

app.use(limiter);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(lndRoutes);

const server = app.listen(process.env.PORT || 3000, () => {
  Logger.log('info', `Listening on port ${process.env.PORT || 3000}`);
});

export default server;
