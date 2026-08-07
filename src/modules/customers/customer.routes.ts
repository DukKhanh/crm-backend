import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createCustomerSchema, customerIdSchema, updateCustomerSchema } from '../../schemas/customer.schema';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { requirePermission } from '../authorization/authorization.middleware';
import { Permission } from '../authorization/permissions';
import { customerController } from './customer.controller';

const router = Router();
router.use(verifyToken);
router.get('/', requirePermission(Permission.CUSTOMER_READ_OWN), asyncHandler(customerController.list));
router.get('/:id', requirePermission(Permission.CUSTOMER_READ_OWN), validate(customerIdSchema), asyncHandler(customerController.getById));
router.post('/', requirePermission(Permission.CUSTOMER_CREATE), validate(createCustomerSchema), asyncHandler(customerController.create));
router.patch('/:id', requirePermission(Permission.CUSTOMER_UPDATE_OWN), validate(updateCustomerSchema), asyncHandler(customerController.update));
router.delete('/:id', requirePermission(Permission.CUSTOMER_DELETE_OWN), validate(customerIdSchema), asyncHandler(customerController.delete));

export default router;
