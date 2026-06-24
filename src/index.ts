import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import customerRoutes from './routes/customer.routes.js';
import taskRoutes from './routes/task.routes.js';
import profileRoutes from './routes/profile.routes.js';
import noteRoutes from './routes/note.routes.js';

dotenv.config();

const app = express();
const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : 3000;

// Prisma init (THÊM MỚI)
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notes', noteRoutes);

// START SERVER (ĐÃ SỬA)
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ DATABASE CONNECTION FAILED:', err);
    process.exit(1); // ép crash để Render thấy lỗi thật
  }

  console.log("🔥 REACH BEFORE LISTEN");

  app.listen(PORT, '0.0.0.0', () => {
  console.log("🚀 SERVER STARTED");
  });
}

startServer();