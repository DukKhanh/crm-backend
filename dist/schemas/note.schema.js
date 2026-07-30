"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNoteSchema = void 0;
const zod_1 = require("zod");
exports.createNoteSchema = zod_1.z.object({ body: zod_1.z.object({ customer_id: zod_1.z.string().uuid(), content: zod_1.z.string().trim().min(1).max(3000) }).strict() });
