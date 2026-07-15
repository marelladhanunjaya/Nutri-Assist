import Client from '../models/Client.js';
import Progress from '../models/Progress.js';
import { canAccessClient } from '../services/accessService.js';
import { summarizeProgress } from '../services/nutritionService.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const progressPopulation = [
  { path: 'client', populate: { path: 'user', select: 'name email' } },
  { path: 'recordedBy', select: 'name role' },
];

export const listProgress = asyncHandler(async (req, res) => {
  const clientFilter = req.user.role === 'admin'
    ? {}
    : req.user.role === 'dietitian'
      ? { dietitian: req.user._id }
      : { user: req.user._id };
  const clients = await Client.find(clientFilter).select('_id dailyCalorieTarget');
  const allowedIds = clients.map((client) => String(client._id));
  if (req.query.client && !allowedIds.includes(String(req.query.client))) {
    throw new AppError('You cannot access progress for this client', 403);
  }
  const filter = { client: req.query.client || { $in: clients.map((client) => client._id) } };
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = new Date(req.query.from);
    if (req.query.to) filter.date.$lte = new Date(req.query.to);
  }
  const entries = await Progress.find(filter).populate(progressPopulation).sort({ date: 1 });
  const target = clients.find((client) => String(client._id) === String(req.query.client || entries[0]?.client?._id))?.dailyCalorieTarget;
  res.json({ success: true, progress: entries, summary: summarizeProgress(entries, target) });
});

export const createProgress = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.validated.body.client);
  if (!client) throw new AppError('Client not found', 404);
  if (!canAccessClient(req.user, client)) throw new AppError('You cannot record progress for this client', 403);
  const entry = await Progress.create({ ...req.validated.body, recordedBy: req.user._id });
  await entry.populate(progressPopulation);
  res.status(201).json({ success: true, progress: entry });
});

export const updateProgress = asyncHandler(async (req, res) => {
  const entry = await Progress.findById(req.params.id);
  if (!entry) throw new AppError('Progress record not found', 404);
  const currentClient = await Client.findById(entry.client);
  const targetClient = await Client.findById(req.validated.body.client);
  if (!targetClient) throw new AppError('Client not found', 404);
  if (!canAccessClient(req.user, currentClient) || !canAccessClient(req.user, targetClient)) {
    throw new AppError('You cannot edit this progress record', 403);
  }
  Object.assign(entry, req.validated.body, { recordedBy: entry.recordedBy });
  await entry.save();
  await entry.populate(progressPopulation);
  res.json({ success: true, progress: entry });
});

export const deleteProgress = asyncHandler(async (req, res) => {
  const entry = await Progress.findById(req.params.id);
  if (!entry) throw new AppError('Progress record not found', 404);
  const client = await Client.findById(entry.client);
  if (!canAccessClient(req.user, client)) throw new AppError('You cannot remove this progress record', 403);
  await entry.deleteOne();
  res.json({ success: true, message: 'Progress entry removed' });
});
