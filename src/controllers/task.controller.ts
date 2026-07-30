import type { NextFunction, Response } from 'express';
import prisma from '../config/prisma';
import type { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../errors/AppError';

const canAccessCustomer = async (req: AuthRequest, customerId: string) => {
  return prisma.customer.findFirst({
    where: { id: customerId, ...(req.user.role === 'ADMIN' ? {} : { ownerId: req.user.userId }) },
    select: { id: true },
  });
};

const taskWhere = (req: AuthRequest, id?: string) => ({
  ...(id ? { id } : {}),
  ...(req.user.role === 'ADMIN'
    ? {}
    : { OR: [{ assigneeId: req.user.userId }, { createdById: req.user.userId }] }),
});

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tasks = await prisma.task.findMany({
      where: taskWhere(req),
      include: {
        customer: { select: { id: true, name: true } },
        assignee: { select: { id: true, full_name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(tasks);
  } catch (error) { next(error); }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await canAccessCustomer(req, req.body.customer_id);
    if (!customer) throw new AppError(404, 'Không tìm thấy khách hàng');
    const assigneeId = req.body.assigneeId ?? req.user.userId;
    if (assigneeId !== req.user.userId && req.user.role === 'EMPLOYEE') {
      throw new AppError(403, 'Employee không thể giao việc cho người khác');
    }
    const assignee = await prisma.user.findUnique({ where: { id: assigneeId }, select: { id: true } });
    if (!assignee) throw new AppError(400, 'Người được giao việc không tồn tại');
    const task = await prisma.task.create({
      data: {
        title: req.body.title,
        description: req.body.description ?? null,
        deadline: req.body.deadline ? new Date(req.body.deadline) : null,
        customer_id: req.body.customer_id,
        createdById: req.user.userId,
        assigneeId,
      },
    });
    res.status(201).json(task);
  } catch (error) { next(error); }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.task.findFirst({ where: taskWhere(req, req.params.id), select: { id: true } });
    if (!existing) throw new AppError(404, 'Không tìm thấy công việc');
    const task = await prisma.task.update({ where: { id: existing.id }, data: { status: req.body.status } });
    res.status(200).json(task);
  } catch (error) { next(error); }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.task.findFirst({ where: taskWhere(req, req.params.id), select: { id: true } });
    if (!existing) throw new AppError(404, 'Không tìm thấy công việc');
    if (req.body.customer_id && !(await canAccessCustomer(req, req.body.customer_id))) {
      throw new AppError(404, 'Không tìm thấy khách hàng');
    }
    if (req.body.assigneeId && req.body.assigneeId !== req.user.userId && req.user.role === 'EMPLOYEE') {
      throw new AppError(403, 'Employee không thể giao việc cho người khác');
    }
    const data = {
      ...req.body,
      ...(req.body.deadline !== undefined ? { deadline: req.body.deadline ? new Date(req.body.deadline) : null } : {}),
    };
    const task = await prisma.task.update({ where: { id: existing.id }, data });
    res.status(200).json(task);
  } catch (error) { next(error); }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.task.findFirst({ where: taskWhere(req, req.params.id), select: { id: true } });
    if (!existing) throw new AppError(404, 'Không tìm thấy công việc');
    await prisma.task.delete({ where: { id: existing.id } });
    res.status(200).json({ message: 'Đã xóa công việc' });
  } catch (error) { next(error); }
};
