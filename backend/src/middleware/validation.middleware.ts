import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError as ExpressValidationError } from 'express-validator';
import { ValidationError } from '../utils/errors';

export const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMap: Record<string, string> = {};

    errors.array().forEach((error: ExpressValidationError) => {
      if (error.type === 'field') {
        errorMap[error.path] = error.msg;
      }
    });

    throw new ValidationError('Validation failed', errorMap);
  }

  next();
};

export default validate;
