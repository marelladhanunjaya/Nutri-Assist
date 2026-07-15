import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppError('Authentication required', 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Session is invalid or expired', 401);
  }

  const user = await User.findById(payload.sub);
  if (!user || user.status !== 'active') throw new AppError('Account is unavailable', 401);
  req.user = user;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) return next(new AppError('You do not have permission for this action', 403));
  next();
};
