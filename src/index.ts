import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import app from './app';

dotenv.config();

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

startServer();