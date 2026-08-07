import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { requirePermission } from '../authorization/authorization.middleware';
import { Permission } from '../authorization/permissions';
import { userController } from './user.controller';
import { listUsersSchema, updateUserRoleSchema, updateUserStatusSchema } from './user.schema';

const router = Router();
router.use(verifyToken);
router.get('/', requirePermission(Permission.USER_READ_ANY), validate(listUsersSchema), asyncHandler(userController.list));
router.patch('/:id/role', requirePermission(Permission.USER_MANAGE_ROLE), validate(updateUserRoleSchema), asyncHandler(userController.updateRole));
router.patch('/:id/status', requirePermission(Permission.USER_MANAGE_STATUS), validate(updateUserStatusSchema), asyncHandler(userController.updateStatus));

export default router;
