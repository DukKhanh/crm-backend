"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.getCustomers = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const AppError_1 = require("../errors/AppError");
const customerWhere = (req, id) => ({
    ...(id ? { id } : {}),
    ...(req.user.role === 'ADMIN' ? {} : { ownerId: req.user.userId }),
});
const getCustomers = async (req, res, next) => {
    try {
        const customers = await prisma_1.default.customer.findMany({
            where: customerWhere(req),
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(customers);
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomers = getCustomers;
const getCustomerById = async (req, res, next) => {
    try {
        const customer = await prisma_1.default.customer.findFirst({
            where: customerWhere(req, req.params.id),
            include: {
                tasks: { orderBy: { createdAt: 'desc' } },
                notes: { orderBy: { createdAt: 'desc' }, include: { author: { select: { id: true, full_name: true } } } },
            },
        });
        if (!customer)
            throw new AppError_1.AppError(404, 'Không tìm thấy khách hàng');
        res.status(200).json(customer);
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerById = getCustomerById;
const createCustomer = async (req, res, next) => {
    try {
        const customer = await prisma_1.default.customer.create({
            data: { ...req.body, email: req.body.email || null, ownerId: req.user.userId },
        });
        res.status(201).json(customer);
    }
    catch (error) {
        next(error);
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res, next) => {
    try {
        const existing = await prisma_1.default.customer.findFirst({ where: customerWhere(req, req.params.id), select: { id: true } });
        if (!existing)
            throw new AppError_1.AppError(404, 'Không tìm thấy khách hàng');
        const customer = await prisma_1.default.customer.update({ where: { id: existing.id }, data: req.body });
        res.status(200).json(customer);
    }
    catch (error) {
        next(error);
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res, next) => {
    try {
        const existing = await prisma_1.default.customer.findFirst({ where: customerWhere(req, req.params.id), select: { id: true } });
        if (!existing)
            throw new AppError_1.AppError(404, 'Không tìm thấy khách hàng');
        await prisma_1.default.customer.delete({ where: { id: existing.id } });
        res.status(200).json({ message: 'Đã xóa khách hàng thành công' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCustomer = deleteCustomer;
