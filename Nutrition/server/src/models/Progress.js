import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true, default: Date.now },
    weightKg: { type: Number, min: 20, max: 500 },
    caloriesConsumed: { type: Number, min: 0, max: 15000, default: 0 },
    waterLitres: { type: Number, min: 0, max: 15, default: 0 },
    exerciseMinutes: { type: Number, min: 0, max: 1440, default: 0 },
    adherencePercent: { type: Number, min: 0, max: 100, default: 0 },
    mood: { type: String, enum: ['great', 'good', 'okay', 'low'], default: 'good' },
    notes: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

progressSchema.index({ client: 1, date: -1 });
export default mongoose.model('Progress', progressSchema);
