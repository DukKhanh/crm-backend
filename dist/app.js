"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const prisma_1 = __importDefault(require("./config/prisma"));
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const note_routes_1 = __importDefault(require("./routes/note.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const requestContext_middleware_1 = require("./middlewares/requestContext.middleware");
const app = (0, express_1.default)();
const allowedOrigins = env_1.env.CORS_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean);
if (env_1.env.TRUST_PROXY > 0)
    app.set('trust proxy', env_1.env.TRUST_PROXY);
app.disable('x-powered-by');
app.use(requestContext_middleware_1.requestContext);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || (env_1.env.NODE_ENV !== 'production' && allowedOrigins.length === 0))
            return callback(null, true);
        callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ limit: '1mb', extended: true }));
app.get('/health/live', (_req, res) => res.json({ status: 'ok', uptimeSeconds: Math.floor(process.uptime()) }));
app.get('/health/ready', async (_req, res) => {
    try {
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.json({ status: 'ready' });
    }
    catch {
        res.status(503).json({ status: 'not_ready' });
    }
});
app.get('/health', (_req, res) => res.redirect(307, '/health/ready'));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/customers', customer_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use('/api/profile', profile_routes_1.default);
app.use('/api/notes', note_routes_1.default);
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
exports.default = app;
