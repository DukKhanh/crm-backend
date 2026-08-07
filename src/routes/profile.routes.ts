import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { changePassword } from '../controllers/profile.controller';
import { savePushToken } from '../controllers/profile.controller';
import { validate } from '../middlewares/validate.middleware';
import { changePasswordSchema, pushTokenSchema, updateProfileSchema } from '../schemas/profile.schema';

const router = Router();
router.use(verifyToken);
router.get('/', getProfile);
router.put('/', validate(updateProfileSchema), updateProfile);
router.put('/change-password', validate(changePasswordSchema), changePassword);
router.put('/push-token', validate(pushTokenSchema), savePushToken);

export default router;
