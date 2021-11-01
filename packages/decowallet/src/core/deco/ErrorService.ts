import { ServerError, ServerParseError } from '@apollo/client';
import * as Sentry from '@sentry/react-native';
import { CaptureContext } from '@sentry/types';
import { ErrorInfo } from 'react';

const captureException = (error: Error | ServerError | ServerParseError | string): void => {
  if (!__DEV__) {
    Sentry.captureException(error);
  }
};

const captureJsException = (error: Error, errorInfo: ErrorInfo): void => {
  const context: CaptureContext = { extra: { errorInfo } };

  if (!__DEV__) {
    Sentry.captureException(error, context);
  }
};

const captureNetworkError = (error: Error | ServerError | ServerParseError): void => {
  captureException(error);
};

const captureCustomError = (error: string): void => {
  captureException(error);
};

const methods = {
  captureJsException,
  captureNetworkError,
  captureCustomError,
};

export default methods;
