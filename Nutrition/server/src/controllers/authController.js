import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.validated.body;
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('An account with this email already exists', 409);

  const user = await User.create({
    name,
    email,
    password,
    role,
    status: role === 'dietitian' ? 'pending' : 'active',
  });

  const message = role === 'dietitian'
    ? 'Registration received. An administrator must approve your dietitian account.'
    : 'Account created successfully';
  res.status(201).json({ success: true, message, user: user.toSafeObject(), token: role === 'user' ? signToken(user) : null });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid email or password', 401);
  if (user.status === 'pending') throw new AppError('Your account is awaiting administrator approval', 403);
  if (user.status === 'suspended') throw new AppError('Your account has been suspended', 403);

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, token: signToken(user), user: user.toSafeObject() });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});
