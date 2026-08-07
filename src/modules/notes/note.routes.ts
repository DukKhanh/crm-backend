import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createNoteSchema } from '../../schemas/note.schema';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { requirePermission } from '../authorization/authorization.middleware';
import { Permission } from '../authorization/permissions';
import { noteController } from './note.controller';

const router = Router();
router.use(verifyToken);
router.post('/', requirePermission(Permission.NOTE_CREATE_OWN), validate(createNoteSchema), asyncHandler(noteController.create));

export default router;
