import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.').replace(/^body\./, ''),
      message: issue.message,
    }));
    return next(new AppError('Please correct the highlighted fields', 400, details));
  }
  req.validated = result.data;
  next();
};
