import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME?.trim() || 'CRM Administrator';

  if (!email || !password || password.length < 12) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) before seeding');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      full_name: fullName,
      password_hash: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    update: {
      full_name: fullName,
      password_hash: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      tokenVersion: { increment: 1 },
    },
  });
}

main()
  .finally(async () => prisma.$disconnect());
