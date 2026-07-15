import Client from '../models/Client.js';
import User from '../models/User.js';
import { canAccessClient, canManageClient } from '../services/accessService.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const population = [
  { path: 'user', select: 'name email phone status' },
  { path: 'dietitian', select: 'name email' },
];

export const listClients = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === 'dietitian') filter = { dietitian: req.user._id };
  if (req.user.role === 'user') filter = { user: req.user._id };
  const clients = await Client.find(filter).populate(population).sort({ updatedAt: -1 });
  res.json({ success: true, clients });
});

export const getMyClient = asyncHandler(async (req, res) => {
  const client = await Client.findOne({ user: req.user._id }).populate(population);
  res.json({ success: true, client });
});

export const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id).populate(population);
  if (!client) throw new AppError('Client not found', 404);
  if (!canAccessClient(req.user, client)) throw new AppError('You cannot access this client', 403);
  res.json({ success: true, client });
});

export const createClient = asyncHandler(async (req, res) => {
  const input = req.validated.body;
  const account = await User.findById(input.user);
  if (!account || account.role !== 'user') throw new AppError('Select a valid user account', 400);
  if (await Client.exists({ user: input.user })) throw new AppError('This user already has a client profile', 409);
  const client = await Client.create({
    ...input,
    dietitian: req.user.role === 'dietitian' ? req.user._id : input.dietitian || null,
    dateOfBirth: input.dateOfBirth || undefined,
  });
  await client.populate(population);
  res.status(201).json({ success: true, client });
});

export const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw new AppError('Client not found', 404);
  if (!canManageClient(req.user, client)) throw new AppError('You cannot edit this client', 403);
  const input = req.validated.body;
  const immutableUser = client.user;
  Object.assign(client, { ...input, user: immutableUser, dietitian: input.dietitian || null, dateOfBirth: input.dateOfBirth || undefined });
  if (req.user.role === 'dietitian') client.dietitian = req.user._id;
  await client.save();
  await client.populate(population);
  res.json({ success: true, client });
});

export const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw new AppError('Client not found', 404);
  if (!canManageClient(req.user, client)) throw new AppError('You cannot remove this client', 403);
  await client.deleteOne();
  res.json({ success: true, message: 'Client profile removed' });
});

export const listUnassignedUsers = asyncHandler(async (_req, res) => {
  const clientUserIds = await Client.distinct('user');
  const users = await User.find({ role: 'user', status: 'active', _id: { $nin: clientUserIds } }).select('name email');
  res.json({ success: true, users });
});
