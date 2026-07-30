"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerIdSchema = exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const idParams = zod_1.z.object({ id: zod_1.z.string().uuid() });
const customerFields = {
    name: zod_1.z.string().trim().min(2).max(120),
    phone: zod_1.z.string().trim().max(30).optional().nullable(),
    email: zod_1.z.string().trim().email().optional().nullable().or(zod_1.z.literal('')),
    company: zod_1.z.string().trim().max(120).optional().nullable(),
    address: zod_1.z.string().trim().max(255).optional().nullable(),
    status: zod_1.z.nativeEnum(client_1.CustomerStatus).optional(),
};
exports.createCustomerSchema = zod_1.z.object({ body: zod_1.z.object(customerFields).strict() });
exports.updateCustomerSchema = zod_1.z.object({ params: idParams, body: zod_1.z.object(customerFields).partial().strict().refine((v) => Object.keys(v).length > 0) });
exports.customerIdSchema = zod_1.z.object({ params: idParams });
