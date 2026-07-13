import { Router } from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, streamNotifications } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/notifications/stream', authMiddleware, streamNotifications);
router.get('/notifications', authMiddleware, getNotifications);
router.get('/notifications/unread-count', authMiddleware, getUnreadCount);
router.post('/notifications/:notificationId/read', authMiddleware, markAsRead);
router.post('/notifications/read-all', authMiddleware, markAllAsRead);

export default router;
