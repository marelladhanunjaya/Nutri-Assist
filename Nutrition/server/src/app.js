import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import mealPlanRoutes from './routes/mealPlanRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-8' }));

app.get('/api/health', (_req, res) => res.json({ success: true, service: 'Nutrition Assistant API' }));
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
