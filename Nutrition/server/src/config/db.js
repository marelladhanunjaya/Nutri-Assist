import mongoose from 'mongoose';

export async function connectDatabase(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error('MONGODB_URI is not configured');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
