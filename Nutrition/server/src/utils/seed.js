import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import Client from '../models/Client.js';
import MealPlan from '../models/MealPlan.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';

const demoPassword = 'Demo@123';

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  await connectDatabase();
  await Promise.all([Progress.deleteMany(), MealPlan.deleteMany(), Client.deleteMany(), User.deleteMany()]);

  const [admin, dietitian, clientUser] = await User.create([
    { name: 'Platform Admin', email: 'admin@nutrition.local', password: demoPassword, role: 'admin', status: 'active' },
    { name: 'Dr. Ananya Rao', email: 'dietitian@nutrition.local', password: demoPassword, role: 'dietitian', status: 'active' },
    { name: 'Arjun Kumar', email: 'user@nutrition.local', password: demoPassword, role: 'user', status: 'active' },
  ]);

  const client = await Client.create({
    user: clientUser._id,
    dietitian: dietitian._id,
    dateOfBirth: new Date('1998-06-15'),
    gender: 'male',
    heightCm: 174,
    currentWeightKg: 78,
    targetWeightKg: 72,
    activityLevel: 'moderate',
    goal: 'weight-loss',
    dailyCalorieTarget: 2100,
    dietaryPreference: 'non-vegetarian',
    allergies: ['Peanuts'],
    medicalConditions: [],
    notes: 'Prefers familiar South Indian meals and an early dinner.',
  });

  await MealPlan.create({
    client: client._id,
    createdBy: dietitian._id,
    title: 'Balanced South Indian Plan',
    description: 'A practical calorie-controlled plan with high protein and familiar foods.',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 86400000),
    status: 'active',
    meals: [
      { name: 'Breakfast', time: '08:00', items: [
        { name: 'Vegetable idli', quantity: '3 pieces', calories: 270, protein: 9, carbs: 52, fat: 3 },
        { name: 'Sambar', quantity: '1 bowl', calories: 120, protein: 6, carbs: 20, fat: 2 },
      ] },
      { name: 'Lunch', time: '13:00', items: [
        { name: 'Brown rice', quantity: '1 cup', calories: 215, protein: 5, carbs: 45, fat: 2 },
        { name: 'Chicken curry', quantity: '150 g', calories: 320, protein: 35, carbs: 8, fat: 16 },
        { name: 'Vegetable salad', quantity: '1 bowl', calories: 90, protein: 3, carbs: 16, fat: 2 },
      ] },
      { name: 'Dinner', time: '19:30', items: [
        { name: 'Chapati', quantity: '3 pieces', calories: 300, protein: 9, carbs: 60, fat: 4 },
        { name: 'Paneer bhurji', quantity: '120 g', calories: 280, protein: 20, carbs: 10, fat: 18 },
      ] },
    ],
  });

  const progress = Array.from({ length: 7 }, (_, index) => ({
    client: client._id,
    recordedBy: clientUser._id,
    date: new Date(Date.now() - (6 - index) * 86400000),
    weightKg: Number((78 - index * 0.16).toFixed(1)),
    caloriesConsumed: 2250 - index * 28,
    waterLitres: 2.1 + index * 0.1,
    exerciseMinutes: 25 + index * 5,
    adherencePercent: 68 + index * 4,
    mood: index > 3 ? 'great' : 'good',
  }));
  await Progress.insertMany(progress);

  console.log('Demo data created');
  console.log(`Admin: admin@nutrition.local / ${demoPassword}`);
  console.log(`Dietitian: dietitian@nutrition.local / ${demoPassword}`);
  console.log(`User: user@nutrition.local / ${demoPassword}`);
  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectDatabase();
  process.exit(1);
});
