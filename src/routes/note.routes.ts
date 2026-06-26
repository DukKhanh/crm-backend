import { Router } from 'express';
import { createNote } from '../controllers/note.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.post('/', createNote);

export default router;