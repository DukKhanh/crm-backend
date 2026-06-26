import type { Response } from 'express';
import prisma from '../config/prisma';
import type { AuthRequest } from '../middlewares/auth.middleware';
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

// 1. Lấy danh sách công việc (Kèm tên khách hàng)
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { customer: { select: { name: true } } }, // Lấy thêm tên KH
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// 2. Tạo công việc mới
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, deadline, customer_id } = req.body;
    const newTask = await prisma.task.create({
      data: { title, description, deadline, customer_id }
    });

      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      if (user?.expoPushToken && Expo.isExpoPushToken(user.expoPushToken)) {
        const messages = [{
          to: user.expoPushToken,
          sound: 'default',
          title: 'Có công việc mới! 📋',
          body: `Bạn vừa tạo công việc: ${title}`,
          data: { taskId: newTask.id },
        }];
        
        // Gửi đi
        await expo.sendPushNotificationsAsync(messages as any);
      }
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo công việc', error });
  }
};



// 3. Cập nhật trạng thái công việc
export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status }
    });
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật', error });
  }
};

// 4. Cập nhật toàn bộ thông tin công việc (Tiêu đề, KH, Hạn chót)
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, deadline, customer_id } = req.body;
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { title, deadline, customer_id }
    });
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật công việc', error });
  }
};

// 5. Xóa công việc
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.task.delete({ where: { id } });
    res.status(200).json({ message: 'Đã xóa công việc' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa công việc', error });
  }
};
