import type { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import type { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../errors/AppError';

const customerWhere = (req: AuthRequest, id?: string) => ({
  ...(id ? { id } : {}),
  ...(req.user.role === 'ADMIN' ? {} : { ownerId: req.user.userId }),
});

export const getCustomers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customers = await prisma.customer.findMany({
      where: customerWhere(req),
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(customers);
  } catch (error) { next(error); }
};

export const getCustomerById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await prisma.customer.findFirst({
      where: customerWhere(req, req.params.id),
      include: {
        tasks: { orderBy: { createdAt: 'desc' } },
        notes: { orderBy: { createdAt: 'desc' }, include: { author: { select: { id: true, full_name: true } } } },
      },
    });
    if (!customer) throw new AppError(404, 'Không tìm thấy khách hàng');
    res.status(200).json(customer);
  } catch (error) { next(error); }
};

export const createCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.create({
      data: { ...req.body, email: req.body.email || null, ownerId: req.user.userId },
    });
    res.status(201).json(customer);
  } catch (error) { next(error); }
};

export const updateCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.customer.findFirst({ where: customerWhere(req, req.params.id), select: { id: true } });
    if (!existing) throw new AppError(404, 'Không tìm thấy khách hàng');
    const customer = await prisma.customer.update({ where: { id: existing.id }, data: req.body });
    res.status(200).json(customer);
  } catch (error) { next(error); }
};

export const deleteCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.customer.findFirst({ where: customerWhere(req, req.params.id), select: { id: true } });
    if (!existing) throw new AppError(404, 'Không tìm thấy khách hàng');
    await prisma.customer.delete({ where: { id: existing.id } });
    res.status(200).json({ message: 'Đã xóa khách hàng thành công' });
  } catch (error) { next(error); }
};
