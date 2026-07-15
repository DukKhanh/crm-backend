import { Router } from 'express';
import {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// All task routes require a valid JWT
router.use(verifyToken);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTaskStatus);
router.put('/:id/edit', updateTask);
router.delete('/:id', deleteTask);

export default router;