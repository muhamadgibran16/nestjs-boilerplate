import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import {
  and,
  desc,
  eq,
  getTableColumns,
  ilike,
  isNull,
  or,
  SQL,
} from 'drizzle-orm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Database } from '../database/database.types';
import { PublicUser } from './dto/user.dto';
import { NewUser, User, users } from './users.schema';

/** Semua kolom kecuali password: dipakai di setiap query yang hasilnya dikirim ke client. */
const { password: _password, ...publicColumns } = getTableColumns(users);

/** Hanya user yang belum di-soft-delete. */
const notDeleted = isNull(users.deletedAt);

@Injectable()
export class UsersRepository {
  constructor(@InjectDrizzle() private readonly db: Database) {}

  async findById(id: string): Promise<PublicUser | null> {
    const [user] = await this.db
      .select(publicColumns)
      .from(users)
      .where(and(eq(users.id, id), notDeleted))
      .limit(1);
    return user ?? null;
  }

  async findByEmail(email: string): Promise<PublicUser | null> {
    const [user] = await this.db
      .select(publicColumns)
      .from(users)
      .where(and(eq(users.email, email.toLowerCase()), notDeleted))
      .limit(1);
    return user ?? null;
  }

  /** Ikut mengambil hash password. Hanya untuk proses login. */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email.toLowerCase()), notDeleted))
      .limit(1);
    return user ?? null;
  }

  async findPaginated(
    query: PaginationQueryDto,
  ): Promise<[PublicUser[], number]> {
    const search = query.search?.trim();
    const where: SQL | undefined = search
      ? and(
          notDeleted,
          or(
            ilike(users.name, `%${search}%`),
            ilike(users.email, `%${search}%`),
          ),
        )
      : notDeleted;

    const [items, total] = await Promise.all([
      this.db
        .select(publicColumns)
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(query.limit)
        .offset(query.skip),
      this.db.$count(users, where),
    ]);
    return [items, total];
  }

  async create(data: NewUser): Promise<PublicUser> {
    const [user] = await this.db
      .insert(users)
      .values(data)
      .returning(publicColumns);
    return user;
  }

  async update(id: string, data: Partial<NewUser>): Promise<PublicUser> {
    const [user] = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning(publicColumns);
    return user;
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, id));
  }
}
