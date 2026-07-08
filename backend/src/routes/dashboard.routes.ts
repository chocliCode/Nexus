import { Router } from 'express';
import { getDashboard, getAdminDashboardStats } from '../controllers/dashboard.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// UC-09: Dashboard de progreso
router.get('/dashboard', authMiddleware, getDashboard);

// UAT-15: Estadísticas para el Admin
router.get('/dashboard/stats', authMiddleware, requireRole('Admin'), getAdminDashboardStats);

export default router;
