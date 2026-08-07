import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './config/prisma';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import customerRoutes from './modules/customers/customer.routes';
import taskRoutes from './modules/tasks/task.routes';
import profileRoutes from './routes/profile.routes';
import noteRoutes from './modules/notes/note.routes';
import userRoutes from './modules/users/user.routes';
import securityEventRoutes from './modules/security-events/securityEvent.routes';
import adminRoutes from './modules/admin/admin.routes';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './docs/openapi';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { requestContext } from './middlewares/requestContext.middleware';

const app = express();
const allowedOrigins = env.CORS_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean);
if (env.TRUST_PROXY > 0) app.set('trust proxy', env.TRUST_PROXY);
app.disable('x-powered-by');
app.use(requestContext);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || (env.NODE_ENV !== 'production' && allowedOrigins.length === 0)) return callback(null, true);
    callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

app.get('/health/live', (_req, res) => res.json({ status: 'ok', uptimeSeconds: Math.floor(process.uptime()) }));
app.get('/health/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not_ready' });
  }
});
app.get('/health', (_req, res) => res.redirect(307, '/health/ready'));
app.get('/api/openapi.json', (_req, res) => res.status(200).json(openApiDocument));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  customSiteTitle: 'CRM Connect API',
  swaggerOptions: { persistAuthorization: true },
}));

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/security-events', securityEventRoutes);
app.use('/api/admin', adminRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
app.use(cors());
export default app;
