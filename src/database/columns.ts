import { timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Kolom standar untuk setiap tabel: UUID, timestamp, dan soft delete.
 * Pakai dengan spread: `pgTable('products', { ...baseColumns, name: ... })`
 */
export const baseColumns = {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
};
