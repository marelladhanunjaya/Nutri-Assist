import 'dotenv/config';
import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';

const port = process.env.PORT || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must contain at least 32 characters');
  process.exit(1);
}

await connectDatabase();
const server = app.listen(port, () => console.log(`Nutrition Assistant API running on port ${port}`));

async function shutdown(signal) {
  console.log(`${signal} received. Closing gracefully.`);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
