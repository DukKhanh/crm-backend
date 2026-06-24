import { Router } from 'express';
import { getTasks, createTask, updateTaskStatus, updateTask, deleteTask } from '../controllers/task.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();
// Bảo vệ API bằng token
router.use(verifyToken);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTaskStatus);
router.put('/:id', updateTaskStatus); // API cập nhật trạng thái cũ
router.put('/:id/edit', updateTask);  // Thêm: API Sửa thông tin
router.delete('/:id', deleteTask);    // Thêm: API Xóa
// router.delete('/:id', (req, res) => { res.send('Delete task') });

export default router;