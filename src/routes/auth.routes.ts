import { Router } from 'express';
import { register, login, refreshTokenAPI } from '../controllers/auth.controller.js';
import {forgotPassword, resetPassword} from '../controllers/auth.controller.js';
const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshTokenAPI);
export default router;