import type { Response } from 'express';
import prisma from '../config/prisma';
import type { AuthRequest } from '../middlewares/auth.middleware';

// 1. Lấy danh sách khách hàng
export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// 2. Lấy chi tiết 1 khách hàng
export const getCustomerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const  id  = req.params.id as string;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { tasks: true, notes: true } // Kéo theo cả tasks và notes của KH này
    });

    if (!customer) {
      res.status(404).json({ message: 'Không tìm thấy khách hàng' });
      return;
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// 3. Tạo khách hàng mới
export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, email, company, address, status } = req.body;
    const newCustomer = await prisma.customer.create({
      data: { name, phone, email, company, address, status }
    });
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// 4. Cập nhật khách hàng
export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const  id  = req.params.id as string;
    const data = req.body;

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data
    });
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật', error });
  }
};

// 5. Xóa khách hàng
export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const  id  = req.params.id as string;
    await prisma.customer.delete({
      where: { id }
    });
    res.status(200).json({ message: 'Đã xóa khách hàng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa', error });
  }
};