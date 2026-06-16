import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Phải có Token mới được vào Profile
router.use(verifyToken);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;