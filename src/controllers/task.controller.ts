import type { Response } from 'express';
import { Expo } from 'expo-server-sdk';
import prisma from '../prisma/client.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/http.js';
import { sendError } from '../utils/response.js';
import type { AuthRequest } from '../types/express.js';

const expo = new Expo();

/** GET /api/tasks — Retrieve all tasks with associated customer name */
export const getTasks = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const tasks = await prisma.task.findMany({
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.status(HTTP_STATUS.OK).json(tasks);
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR, error);
  }
};

/** POST /api/tasks — Create a new task and send a push notification to the creator */
export const createTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, deadline, customer_id } = req.body as {
      title: string;
      description?: string;
      deadline?: string;
      customer_id: string;
    };

    const newTask = await prisma.task.create({
      data: { title, description, deadline, customer_id },
    });

    // Send push notification to the task creator if they have an Expo push token
    if (req.user?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });

      if (user?.expoPushToken && Expo.isExpoPushToken(user.expoPushToken)) {
        await expo.sendPushNotificationsAsync([
          {
            to: user.expoPushToken,
            sound: 'default',
            title: 'New Task Created 📋',
            body: `You just created: ${title}`,
            data: { taskId: newTask.id },
          },
        ]);
      }
    }

    res.status(HTTP_STATUS.CREATED).json(newTask);
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to create task', error);
  }
};

/** PUT /api/tasks/:id — Update the status of a task */
export const updateTaskStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body as { status: string };

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    });

    res.status(HTTP_STATUS.OK).json(updatedTask);
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update task status', error);
  }
};

/** PUT /api/tasks/:id/edit — Update task details (title, deadline, customer) */
export const updateTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, deadline, customer_id } = req.body as {
      title?: string;
      deadline?: string;
      customer_id?: string;
    };

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { title, deadline, customer_id },
    });

    res.status(HTTP_STATUS.OK).json(updatedTask);
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update task', error);
  }
};

/** DELETE /api/tasks/:id — Delete a task */
export const deleteTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.task.delete({ where: { id } });
    res.status(HTTP_STATUS.OK).json({ message: 'Task deleted successfully' });
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete task', error);
  }
};
