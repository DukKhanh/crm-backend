"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.updateTaskStatus = exports.createTask = exports.getTasks = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const AppError_1 = require("../errors/AppError");
const canAccessCustomer = async (req, customerId) => {
    return prisma_1.default.customer.findFirst({
        where: { id: customerId, ...(req.user.role === 'ADMIN' ? {} : { ownerId: req.user.userId }) },
        select: { id: true },
    });
};
const taskWhere = (req, id) => ({
    ...(id ? { id } : {}),
    ...(req.user.role === 'ADMIN'
        ? {}
        : { OR: [{ assigneeId: req.user.userId }, { createdById: req.user.userId }] }),
});
const getTasks = async (req, res, next) => {
    try {
        const tasks = await prisma_1.default.task.findMany({
            where: taskWhere(req),
            include: {
                customer: { select: { id: true, name: true } },
                assignee: { select: { id: true, full_name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(tasks);
    }
    catch (error) {
        next(error);
    }
};
exports.getTasks = getTasks;
const createTask = async (req, res, next) => {
    try {
        const customer = await canAccessCustomer(req, req.body.customer_id);
        if (!customer)
            throw new AppError_1.AppError(404, 'Không tìm thấy khách hàng');
        const assigneeId = req.body.assigneeId ?? req.user.userId;
        if (assigneeId !== req.user.userId && req.user.role === 'EMPLOYEE') {
            throw new AppError_1.AppError(403, 'Employee không thể giao việc cho người khác');
        }
        const assignee = await prisma_1.default.user.findUnique({ where: { id: assigneeId }, select: { id: true } });
        if (!assignee)
            throw new AppError_1.AppError(400, 'Người được giao việc không tồn tại');
        const task = await prisma_1.default.task.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.createTask = createTask;
const updateTaskStatus = async (req, res, next) => {
    try {
        const existing = await prisma_1.default.task.findFirst({ where: taskWhere(req, req.params.id), select: { id: true } });
        if (!existing)
            throw new AppError_1.AppError(404, 'Không tìm thấy công việc');
        const task = await prisma_1.default.task.update({ where: { id: existing.id }, data: { status: req.body.status } });
        res.status(200).json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTaskStatus = updateTaskStatus;
const updateTask = async (req, res, next) => {
    try {
        const existing = await prisma_1.default.task.findFirst({ where: taskWhere(req, req.params.id), select: { id: true } });
        if (!existing)
            throw new AppError_1.AppError(404, 'Không tìm thấy công việc');
        if (req.body.customer_id && !(await canAccessCustomer(req, req.body.customer_id))) {
            throw new AppError_1.AppError(404, 'Không tìm thấy khách hàng');
        }
        if (req.body.assigneeId && req.body.assigneeId !== req.user.userId && req.user.role === 'EMPLOYEE') {
            throw new AppError_1.AppError(403, 'Employee không thể giao việc cho người khác');
        }
        const data = {
            ...req.body,
            ...(req.body.deadline !== undefined ? { deadline: req.body.deadline ? new Date(req.body.deadline) : null } : {}),
        };
        const task = await prisma_1.default.task.update({ where: { id: existing.id }, data });
        res.status(200).json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res, next) => {
    try {
        const existing = await prisma_1.default.task.findFirst({ where: taskWhere(req, req.params.id), select: { id: true } });
        if (!existing)
            throw new AppError_1.AppError(404, 'Không tìm thấy công việc');
        await prisma_1.default.task.delete({ where: { id: existing.id } });
        res.status(200).json({ message: 'Đã xóa công việc' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTask = deleteTask;
