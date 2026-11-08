import * as dotenv from 'dotenv';
import { resolve } from 'path';

/**
 * Muat .env.test (menimpa .env) dan pastikan yang dipakai benar-benar database test,
 * karena isinya akan dihapus.
 */
export function loadTestEnv(): void {
  dotenv.config({
    path: resolve(__dirname, '..', '.env.test'),
    override: true,
    quiet: true,
  });

  const dbName = process.env.DATABASE_URL?.split('?')[0].split('/').pop();
  if (process.env.NODE_ENV !== 'test' || !dbName?.endsWith('_test')) {
    throw new Error(
      'Test e2e hanya boleh jalan dengan NODE_ENV=test dan nama database berakhiran _test',
    );
  }
}
