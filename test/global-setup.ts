import { execSync } from 'child_process';
import { delimiter, resolve } from 'path';
import { Client } from 'pg';
import { loadTestEnv } from './load-test-env';

/** Dijalankan sekali sebelum semua test e2e: kosongkan database lalu terapkan migration. */
export default async function globalSetup(): Promise<void> {
  loadTestEnv();

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(
    'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;',
  );
  await client.end();

  const root = resolve(__dirname, '..');
  execSync('prisma migrate deploy', {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      PATH: `${resolve(root, 'node_modules', '.bin')}${delimiter}${process.env.PATH}`,
    },
  });
}
