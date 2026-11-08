// Konfigurasi Prisma CLI (migrate, generate, studio).
// Prisma 7 tidak membaca .env otomatis, jadi dimuat di sini.
import * as dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config({ path: ['.env', '/volume/.env'], quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Tidak memakai env() agar `prisma generate` tetap jalan tanpa DATABASE_URL (misalnya saat build Docker).
    url: process.env.DATABASE_URL ?? '',
  },
});
