import Client from '../models/Client.js';
import MealPlan from '../models/MealPlan.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboard = asyncHandler(async (_req, res) => {
  const [users, dietitians, pendingDietitians, clients, mealPlans, progressEntries, recentUsers] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'dietitian', status: 'active' }),
    User.countDocuments({ role: 'dietitian', status: 'pending' }),
    Client.countDocuments(),
    MealPlan.countDocuments(),
    Progress.countDocuments(),
    User.find().select('name email role status createdAt').sort({ createdAt: -1 }).limit(6),
  ]);
  res.json({
    success: true,
    stats: { users, dietitians, pendingDietitians, clients, mealPlans, progressEntries },
    recentUsers,
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  const users = await User.find(filter).select('name email phone role status createdAt lastLoginAt').sort({ createdAt: -1 });
  res.json({ success: true, users });
});

export const updateUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id && req.validated.body.status === 'suspended') {
    throw new AppError('You cannot suspend your own account', 400);
  }
  const user = await User.findByIdAndUpdate(req.params.id, req.validated.body, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, user: user.toSafeObject() });
});
