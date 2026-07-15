import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: String, default: '1 serving', trim: true },
    calories: { type: Number, min: 0, default: 0 },
    protein: { type: Number, min: 0, default: 0 },
    carbs: { type: Number, min: 0, default: 0 },
    fat: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    time: { type: String, default: '' },
    items: { type: [foodItemSchema], default: [] },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 1000 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'active', 'completed', 'archived'], default: 'draft' },
    meals: { type: [mealSchema], default: [] },
    totals: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

mealPlanSchema.pre('validate', function calculateTotals(next) {
  const items = this.meals.flatMap((meal) => meal.items || []);
  this.totals = items.reduce(
    (sum, item) => ({
      calories: sum.calories + Number(item.calories || 0),
      protein: sum.protein + Number(item.protein || 0),
      carbs: sum.carbs + Number(item.carbs || 0),
      fat: sum.fat + Number(item.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  next();
});

mealPlanSchema.index({ client: 1, status: 1, startDate: -1 });
export default mongoose.model('MealPlan', mealPlanSchema);
