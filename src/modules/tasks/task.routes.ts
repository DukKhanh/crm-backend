import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createTaskSchema, taskIdSchema, updateTaskSchema, updateTaskStatusSchema } from '../../schemas/task.schema';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { requirePermission } from '../authorization/authorization.middleware';
import { Permission } from '../authorization/permissions';
import { taskController } from './task.controller';

const router = Router();
router.use(verifyToken);
router.get('/', requirePermission(Permission.TASK_READ_RELATED), asyncHandler(taskController.list));
router.post('/', requirePermission(Permission.TASK_CREATE), validate(createTaskSchema), asyncHandler(taskController.create));
router.patch('/:id/status', requirePermission(Permission.TASK_STATUS_ASSIGNED), validate(updateTaskStatusSchema), asyncHandler(taskController.updateStatus));
router.patch('/:id', requirePermission(Permission.TASK_UPDATE_CREATED), validate(updateTaskSchema), asyncHandler(taskController.update));
router.delete('/:id', requirePermission(Permission.TASK_DELETE_CREATED), validate(taskIdSchema), asyncHandler(taskController.delete));

export default router;
