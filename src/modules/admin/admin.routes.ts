import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { requirePermission } from '../authorization/authorization.middleware';
import { Permission } from '../authorization/permissions';
import { adminController } from './admin.controller';

const router = Router();
router.use(verifyToken, requirePermission(Permission.ADMIN_OVERVIEW_READ));
router.get('/overview', asyncHandler(adminController.overview));

export default router;
