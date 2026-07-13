import { Router } from 'express';
import { listMemberships, updateMembership } from '../controllers/membership.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateMembershipSchema } from '../schemas/membership.schema';

const router = Router();

router.get('/memberships', listMemberships);
router.put('/users/profile/membership', authMiddleware, validate(updateMembershipSchema), updateMembership);

export default router;
