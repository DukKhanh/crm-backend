import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => { res.send('Get user profile') });
router.put('/', (req, res) => { res.send('Update user profile') });

export default router;