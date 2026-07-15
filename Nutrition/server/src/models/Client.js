import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dietitian: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    dateOfBirth: Date,
    gender: { type: String, enum: ['female', 'male', 'non-binary', 'prefer-not-to-say'], default: 'prefer-not-to-say' },
    heightCm: { type: Number, min: 50, max: 260 },
    currentWeightKg: { type: Number, min: 20, max: 500 },
    targetWeightKg: { type: Number, min: 20, max: 500 },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very-active'],
      default: 'moderate',
    },
    goal: {
      type: String,
      enum: ['weight-loss', 'weight-gain', 'maintenance', 'muscle-gain', 'medical'],
      default: 'maintenance',
    },
    dailyCalorieTarget: { type: Number, min: 800, max: 7000, default: 2000 },
    dietaryPreference: {
      type: String,
      enum: ['vegetarian', 'vegan', 'non-vegetarian', 'eggetarian', 'other'],
      default: 'vegetarian',
    },
    allergies: [{ type: String, trim: true }],
    medicalConditions: [{ type: String, trim: true }],
    notes: { type: String, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

clientSchema.index({ dietitian: 1, updatedAt: -1 });
export default mongoose.model('Client', clientSchema);
