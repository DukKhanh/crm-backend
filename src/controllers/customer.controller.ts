import type { Response } from 'express';
import prisma from '../prisma/client.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/http.js';
import { sendError } from '../utils/response.js';
import type { AuthRequest } from '../types/express.js';

export const getCustomers = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(HTTP_STATUS.OK).json(customers);
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR, error);
  }
};

export const getCustomerById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { tasks: true, notes: true },
    });

    if (!customer) {
      sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
      return;
    }

    res.status(HTTP_STATUS.OK).json(customer);
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR, error);
  }
};

export const createCustomer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, phone, email, company, address, status } = req.body as {
      name: string;
      phone?: string;
      email?: string;
      company?: string;
      address?: string;
      status?: string;
    };

    const newCustomer = await prisma.customer.create({
      data: { name, phone, email, company, address, status },
    });

    res.status(HTTP_STATUS.CREATED).json(newCustomer);
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR, error);
  }
};

export const updateCustomer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = req.body as Record<string, unknown>;

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data,
    });

    res.status(HTTP_STATUS.OK).json(updatedCustomer);
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update customer', error);
  }
};

export const deleteCustomer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.customer.delete({ where: { id } });
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Customer deleted successfully' });
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete customer', error);
  }
};