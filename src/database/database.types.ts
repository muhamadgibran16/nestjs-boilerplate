import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

/**
 * Tipe instance Drizzle untuk aplikasi ini. Inject dengan decorator resmi:
 * `constructor(@InjectDrizzle() private readonly db: Database) {}`
 */
export type Database = NodePgDatabase<typeof schema>;
