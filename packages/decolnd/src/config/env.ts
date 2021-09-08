import * as dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  dotenv.config();
} else {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
}

const { env } = process;
const { NODE_ENV = 'development', LOGS_FOLDER = 'logs', LOGS_APP = 'app.log', LOGS_ERROR = 'error.log' } = env;

export { NODE_ENV, LOGS_FOLDER, LOGS_APP, LOGS_ERROR };
