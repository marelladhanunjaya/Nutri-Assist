import { z } from 'zod';

const id = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier');
const optionalId = id.optional().or(z.literal(''));

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(72),
    role: z.enum(['user', 'dietitian']).default('user'),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const loginSchema = z.object({
  body: z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) }),
  params: z.object({}),
  query: z.object({}),
});

export const clientSchema = z.object({
  body: z.object({
    user: id,
    dietitian: optionalId,
    dateOfBirth: z.string().optional().or(z.literal('')),
    gender: z.enum(['female', 'male', 'non-binary', 'prefer-not-to-say']).optional(),
    heightCm: z.coerce.number().min(50).max(260),
    currentWeightKg: z.coerce.number().min(20).max(500),
    targetWeightKg: z.coerce.number().min(20).max(500),
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active']),
    goal: z.enum(['weight-loss', 'weight-gain', 'maintenance', 'muscle-gain', 'medical']),
    dailyCalorieTarget: z.coerce.number().int().min(800).max(7000),
    dietaryPreference: z.enum(['vegetarian', 'vegan', 'non-vegetarian', 'eggetarian', 'other']),
    allergies: z.array(z.string().trim().min(1)).default([]),
    medicalConditions: z.array(z.string().trim().min(1)).default([]),
    notes: z.string().max(1000).default(''),
  }),
  params: z.object({ id: id.optional() }),
  query: z.object({}),
});

const foodItem = z.object({
  name: z.string().trim().min(1),
  quantity: z.string().trim().default('1 serving'),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
});

export const mealPlanSchema = z.object({
  body: z.object({
    client: id,
    title: z.string().trim().min(3).max(120),
    description: z.string().max(1000).default(''),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft'),
    meals: z.array(z.object({
      name: z.string().trim().min(1),
      time: z.string().default(''),
      items: z.array(foodItem).min(1),
    })).min(1),
  }).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  }),
  params: z.object({ id: id.optional() }),
  query: z.object({ client: id.optional(), status: z.string().optional() }),
});

export const progressSchema = z.object({
  body: z.object({
    client: id,
    date: z.string().min(1),
    weightKg: z.coerce.number().min(20).max(500),
    caloriesConsumed: z.coerce.number().min(0).max(15000),
    waterLitres: z.coerce.number().min(0).max(15),
    exerciseMinutes: z.coerce.number().int().min(0).max(1440),
    adherencePercent: z.coerce.number().min(0).max(100),
    mood: z.enum(['great', 'good', 'okay', 'low']),
    notes: z.string().max(500).default(''),
  }),
  params: z.object({ id: id.optional() }),
  query: z.object({ client: id.optional(), from: z.string().optional(), to: z.string().optional() }),
});

export const userUpdateSchema = z.object({
  body: z.object({
    role: z.enum(['user', 'dietitian', 'admin']).optional(),
    status: z.enum(['active', 'pending', 'suspended']).optional(),
  }).refine((body) => Object.keys(body).length > 0, 'Provide a role or status'),
  params: z.object({ id }),
  query: z.object({}),
});
