import sendgrid from '@sendgrid/mail';
import config from '../config';
import logger from '../config/logger';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../modules/user/user.entity';

sendgrid.setApiKey(config.SENDGRID_API_KEY);

const sendConfirmEmail = async (to: string): Promise<void> => {
  const token = jwt.sign({ email: to }, config.JWT_SECRET, { expiresIn: '1h' });

  const msg = {
    to,
    from: 'support@decowallet.org',
    templateId: 'd-ccce1569125e491eba45480dd02acaf1',
    dynamicTemplateData: {
      email: to,
      link: `https://decowallet.org/confirm-email/${token}`,
    },
  };

  try {
    await sendgrid.send(msg);
  } catch (error) {
    logger.error(error);
  }
};

const validateEmail = async (token: string): Promise<boolean> => {
  try {
    const decoded: JwtPayload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    const email = String(decoded.email);

    await User.update({ username: email }, { verified: true });

    return true;
  } catch (error) {
    logger.error(error);

    return false;
  }
};

export { sendConfirmEmail, validateEmail };
