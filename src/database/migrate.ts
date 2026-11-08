/**
 * Menerapkan migration SQL di folder /drizzle (hasil `pnpm db:generate`).
 * Memakai migrator bawaan drizzle-orm, jadi tidak butuh drizzle-kit di production.
 *
 *   pnpm db:migrate               (dev, dari source)
 *   node dist/database/migrate.js (production / Docker)
 */
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { ENV_FILE_PATHS } from '../config/configuration';

/** Folder migration, relatif terhadap file ini (sama untuk src/ dan dist/). */
export const MIGRATIONS_FOLDER = resolve(__dirname, '..', '..', 'drizzle');

export async function runMigrations(databaseUrl: string): Promise<void> {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  dotenv.config({ path: ENV_FILE_PATHS, quiet: true });
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL belum di-set.');
    process.exit(1);
  }
  runMigrations(url)
    .then(() => console.log('Migration selesai.'))
    .catch((error: unknown) => {
      console.error('Migration gagal:', error);
      process.exit(1);
    });
}
