import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { changePassword } from '../controllers/profile.controller';
import { savePushToken } from '../controllers/profile.controller';

const router = Router();
// Phải có Token mới được vào Profile
router.use(verifyToken);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/change-password', changePassword);
router.put('/push-token', savePushToken);

export default router;