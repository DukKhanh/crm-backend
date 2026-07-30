import { Router } from 'express';
import { createNote } from '../controllers/note.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createNoteSchema } from '../schemas/note.schema';
const router = Router();
router.use(verifyToken);
router.post('/', validate(createNoteSchema), createNote);
export default router;
