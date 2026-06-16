import { Router } from 'express';
import { getTasks, createTask, updateTaskStatus } from '../controllers/task.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();
// Bảo vệ API bằng token
router.use(verifyToken);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTaskStatus);
// router.delete('/:id', (req, res) => { res.send('Delete task') });

export default router;