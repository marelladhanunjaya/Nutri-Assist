import { AppError } from '../utils/AppError.js';

export function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(error, _req, res, _next) {
  let status = error.statusCode || 500;
  let message = error.message || 'Unexpected server error';

  if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid resource identifier';
  }
  if (error.code === 11000) {
    status = 409;
    message = 'A record with this value already exists';
  }

  if (status >= 500) console.error(error);
  res.status(status).json({
    success: false,
    message,
    details: error.details,
    ...(process.env.NODE_ENV === 'development' && status >= 500 ? { stack: error.stack } : {}),
  });
}
