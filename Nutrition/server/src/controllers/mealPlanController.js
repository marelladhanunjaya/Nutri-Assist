import Client from '../models/Client.js';
import MealPlan from '../models/MealPlan.js';
import { canAccessClient, canManageClient } from '../services/accessService.js';
import { calculateMacroDistribution } from '../services/nutritionService.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populatePlan = [
  { path: 'client', populate: { path: 'user', select: 'name email' } },
  { path: 'createdBy', select: 'name role' },
];

export const listMealPlans = asyncHandler(async (req, res) => {
  const clientFilter = req.user.role === 'admin'
    ? {}
    : req.user.role === 'dietitian'
      ? { dietitian: req.user._id }
      : { user: req.user._id };
  const allowedClients = await Client.find(clientFilter).select('_id');
  const allowedIds = allowedClients.map((item) => String(item._id));
  if (req.query.client && !allowedIds.includes(String(req.query.client))) {
    throw new AppError('You cannot access meal plans for this client', 403);
  }
  const filter = { client: req.query.client || { $in: allowedClients.map((item) => item._id) } };
  if (req.query.status) filter.status = req.query.status;
  const plans = await MealPlan.find(filter).populate(populatePlan).sort({ startDate: -1 });
  res.json({
    success: true,
    mealPlans: plans.map((plan) => ({ ...plan.toObject(), macroDistribution: calculateMacroDistribution(plan.totals) })),
  });
});

export const getMealPlan = asyncHandler(async (req, res) => {
  const plan = await MealPlan.findById(req.params.id).populate(populatePlan);
  if (!plan) throw new AppError('Meal plan not found', 404);
  if (!canAccessClient(req.user, plan.client)) throw new AppError('You cannot access this meal plan', 403);
  res.json({ success: true, mealPlan: { ...plan.toObject(), macroDistribution: calculateMacroDistribution(plan.totals) } });
});

export const createMealPlan = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.validated.body.client);
  if (!client) throw new AppError('Client not found', 404);
  if (!canManageClient(req.user, client)) throw new AppError('You cannot create a plan for this client', 403);
  const plan = await MealPlan.create({ ...req.validated.body, createdBy: req.user._id });
  await plan.populate(populatePlan);
  res.status(201).json({ success: true, mealPlan: plan });
});

export const updateMealPlan = asyncHandler(async (req, res) => {
  const plan = await MealPlan.findById(req.params.id);
  if (!plan) throw new AppError('Meal plan not found', 404);
  const currentClient = await Client.findById(plan.client);
  const targetClient = await Client.findById(req.validated.body.client);
  if (!targetClient) throw new AppError('Client not found', 404);
  if (!canManageClient(req.user, currentClient) || !canManageClient(req.user, targetClient)) {
    throw new AppError('You cannot edit this meal plan', 403);
  }
  Object.assign(plan, req.validated.body, { createdBy: plan.createdBy });
  await plan.save();
  await plan.populate(populatePlan);
  res.json({ success: true, mealPlan: plan });
});

export const deleteMealPlan = asyncHandler(async (req, res) => {
  const plan = await MealPlan.findById(req.params.id);
  if (!plan) throw new AppError('Meal plan not found', 404);
  const client = await Client.findById(plan.client);
  if (!canManageClient(req.user, client)) throw new AppError('You cannot remove this meal plan', 403);
  await plan.deleteOne();
  res.json({ success: true, message: 'Meal plan removed' });
});
