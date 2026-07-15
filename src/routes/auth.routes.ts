import { Router } from 'express';
import {
  register,
  login,
  refreshTokenAPI,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import {
  validateAuthPayload,
  validateRegisterPayload,
} from '../validators/auth.validators.js';

const router = Router();

router.post('/register', validateRegisterPayload, register);
router.post('/login', validateAuthPayload, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshTokenAPI);

export default router;