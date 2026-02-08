import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { z, ZodError } from 'zod';
import ApiError from '../utils/ApiError';

/**
 * Validation middleware for express-validator
 * Runs validation chains and returns errors if any
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const formattedErrors = errors.array().map((error) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
    }));

    // Return validation error
    return res.status(422).json({
      success: false,
      message: 'Validation error',
      errors: formattedErrors,
    });
  };
};

/**
 * Validation middleware for Zod schemas
 */
export const validateZod = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as any;
      
      // Update request with validated/transformed data
      if (validated.body) req.body = validated.body;
      if (validated.query) req.query = validated.query;
      if (validated.params) req.params = validated.params;
      
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(422).json({
          success: false,
          message: 'Validation error',
          errors: formattedErrors,
        });
      }
      return next(error);
    }
  };
};
