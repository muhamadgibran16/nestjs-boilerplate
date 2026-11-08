// Konfigurasi drizzle-kit (generate, migrate, studio, check).
import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: ['.env', '/volume/.env'], quiet: true });

export default defineConfig({
  dialect: 'postgresql',
  // Setiap modul mendefinisikan tabelnya sendiri di *.schema.ts.
  schema: './src/**/*.schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
});
