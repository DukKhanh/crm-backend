import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  savePushToken,
} from '../controllers/profile.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// All profile routes require a valid JWT
router.use(verifyToken);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/change-password', changePassword);
router.put('/push-token', savePushToken);

export default router;