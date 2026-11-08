import { Client } from 'pg';
import { runMigrations } from '../src/database/migrate';
import { loadTestEnv } from './load-test-env';

/** Dijalankan sekali sebelum semua test e2e: kosongkan database lalu terapkan migration. */
export default async function globalSetup(): Promise<void> {
  loadTestEnv();
  const url = process.env.DATABASE_URL!;

  const client = new Client({ connectionString: url });
  await client.connect();
  await client.query(`
    DROP SCHEMA IF EXISTS public CASCADE;
    DROP SCHEMA IF EXISTS drizzle CASCADE;
    CREATE SCHEMA public;
  `);
  await client.end();

  await runMigrations(url);
}
