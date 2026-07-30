"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const AppError_1 = require("../errors/AppError");
const validate = (schema) => (req, _res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) {
        next(new AppError_1.AppError(400, 'Dữ liệu không hợp lệ', result.error.flatten()));
        return;
    }
    const parsed = result.data;
    if (parsed.body)
        req.body = parsed.body;
    if (parsed.params)
        req.params = parsed.params;
    if (parsed.query)
        req.query = parsed.query;
    next();
};
exports.validate = validate;
