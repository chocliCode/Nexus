import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { authRateLimiter, globalRateLimiter } from './middleware/rateLimiter.middleware';

dotenv.config();

import { errorMiddleware } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import sessionRoutes from './routes/session.routes';
import okrRoutes from './routes/okr.routes';
import vacancyRoutes from './routes/vacancy.routes';
import profileRoutes from './routes/profile.routes';
import onboardingRoutes from './routes/onboarding.routes';
import dashboardRoutes from './routes/dashboard.routes';
import matchingRoutes from './routes/matching.routes';
import iaRoutes from './routes/ia.routes';
import notificationRoutes from './routes/notification.routes';
import classroomRoutes from './routes/classroom.routes';
import chatRoutes from './routes/chat.routes';
import courseRoutes from './routes/course.routes';
import membershipRoutes from './routes/membership.routes';

const app = express();

// ============================================================
// Global Middleware
// ============================================================
const corsOptions = {
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Suppress request logs during automated tests to keep output clean
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ============================================================
// Security: Global rate limiter (200 req / 15 min per IP)
// ============================================================
app.use('/api/v1', globalRateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Health Check
// ============================================================
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'nexus-api' });
});

// ============================================================
// Routes
// ============================================================
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes explicitly

// Security: Strict rate limiter on auth endpoints (10 req / 15 min per IP)
app.use('/api/v1/auth', authRateLimiter, authRoutes);
app.use('/api/v1', sessionRoutes);
app.use('/api/v1', okrRoutes);
app.use('/api/v1/vacancies', vacancyRoutes);
app.use('/api/v1', profileRoutes);
app.use('/api/v1', onboardingRoutes);
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1', matchingRoutes);
app.use('/api/v1', iaRoutes);
app.use('/api/v1', notificationRoutes);
app.use('/api/v1', classroomRoutes);
app.use('/api/v1', chatRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1', membershipRoutes);

// ============================================================
// 404 Handler
// ============================================================
app.use((_req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado', code: 'NOT_FOUND' });
});

// ============================================================
// Global Error Handler
// ============================================================
app.use(errorMiddleware);

export default app;
