"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNote = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const AppError_1 = require("../errors/AppError");
const createNote = async (req, res, next) => {
    try {
        const customer = await prisma_1.default.customer.findFirst({
            where: { id: req.body.customer_id, ...(req.user.role === 'ADMIN' ? {} : { ownerId: req.user.userId }) },
            select: { id: true },
        });
        if (!customer)
            throw new AppError_1.AppError(404, 'Không tìm thấy khách hàng');
        const note = await prisma_1.default.note.create({
            data: { customer_id: req.body.customer_id, content: req.body.content, authorId: req.user.userId },
            include: { author: { select: { id: true, full_name: true } } },
        });
        res.status(201).json(note);
    }
    catch (error) {
        next(error);
    }
};
exports.createNote = createNote;
