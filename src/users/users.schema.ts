import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { baseColumns } from '../database/columns';

export const roleEnum = pgEnum('user_role', ['ADMIN', 'USER']);

export const users = pgTable(
  'users',
  {
    ...baseColumns,
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    /** Hash bcrypt. Jangan pernah dikirim ke client (lihat UsersRepository). */
    password: varchar('password', { length: 255 }).notNull(),
    role: roleEnum('role').notNull().default('USER'),
    isActive: boolean('is_active').notNull().default(true),
    isVerified: boolean('is_verified').notNull().default(false),
  },
  (t) => [
    // Email unik hanya untuk user yang belum di-soft-delete, agar bisa dipakai ulang.
    uniqueIndex('users_email_active_key')
      .on(t.email)
      .where(sql`${t.deletedAt} IS NULL`),
    index('users_is_verified_idx').on(t.isVerified),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Role = (typeof roleEnum.enumValues)[number];
export const Role = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const satisfies Record<Role, Role>;
