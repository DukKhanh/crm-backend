import { Router } from 'express';
import { 
  getCustomers, getCustomerById, createCustomer, 
  updateCustomer, deleteCustomer 
} from '../controllers/customer.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Sử dụng middleware bảo vệ cho TẤT CẢ các routes ở dưới
router.use(verifyToken);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;