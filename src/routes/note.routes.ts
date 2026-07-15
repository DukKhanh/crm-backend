import { Router } from 'express';
import { createNote } from '../controllers/note.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// All note routes require a valid JWT
router.use(verifyToken);

router.post('/', createNote);

export default router;