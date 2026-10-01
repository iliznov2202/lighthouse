import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import * as argon2 from 'argon2';

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Development seed is disabled in production');
  const password = process.env.SEED_USER_PASSWORD;
  if (!password || password.length < 8 || password.length > 128 || password.startsWith('replace-')) throw new Error('Set SEED_USER_PASSWORD (8–128 characters) in your local .env');
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  if (decodeURIComponent(new URL(process.env.DATABASE_URL).pathname).endsWith('_prod')) throw new Error('Seed must not target a production database');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await prisma.$transaction(async tx => {
      const school = await tx.school.upsert({ where: { name_city: { name: 'Школа №123', city: 'Москва' } }, update: {}, create: { name: 'Школа №123', city: 'Москва' } });
      for (const name of ['8Б', '9А', '9Б', '10А', '10Б']) {
        await tx.schoolClass.upsert({ where: { schoolId_name: { schoolId: school.id, name } }, update: {}, create: { schoolId: school.id, name } });
      }
      const schoolClass = await tx.schoolClass.findUniqueOrThrow({ where: { schoolId_name: { schoolId: school.id, name: '9Б' } } });
      const users = [{ email: 'anna@mayak.test', name: 'Анна' }, { email: 'ivan@mayak.test', name: 'Иван' }, { email: 'maria@mayak.test', name: 'Мария' }];
      for (const user of users) {
        await tx.user.upsert({ where: { email: user.email }, update: {}, create: { ...user, passwordHash, schoolId: school.id, classId: schoolClass.id } });
      }
    });
    console.log('Seed complete: Школа №123, 8Б/9А/9Б/10А/10Б, 3 students in 9Б. Existing accounts preserved.');
  } finally { await prisma.$disconnect(); }
}
void main().catch(() => { console.error('Seed failed. Check local configuration and database availability.'); process.exitCode = 1; });
