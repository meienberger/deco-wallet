import { FieldError } from '../generated/graphql';

const toErrorMap = (errors: FieldError[]): Record<string, string> => {
  const errorMap: Record<string, string> = {};

  errors.forEach(({ field, message, code }) => {
    if (field) {
      errorMap[field] = message;
    } else {
      errorMap.global = String(code);
    }
  });

  return errorMap;
};

export { toErrorMap };
