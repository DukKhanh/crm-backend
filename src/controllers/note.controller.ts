import type { Response } from 'express';
import prisma from '../prisma/client.js';
import { HTTP_STATUS } from '../constants/http.js';
import { sendError } from '../utils/response.js';
import type { AuthRequest } from '../types/express.js';

/** POST /api/notes — Create a note linked to a customer */
export const createNote = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { customer_id, content } = req.body as {
      customer_id: string;
      content: string;
    };

    if (!content) {
      sendError(res, HTTP_STATUS.BAD_REQUEST, 'Note content must not be empty');
      return;
    }

    const newNote = await prisma.note.create({
      data: { customer_id, content },
    });

    res.status(HTTP_STATUS.CREATED).json(newNote);
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to create note', error);
  }
};