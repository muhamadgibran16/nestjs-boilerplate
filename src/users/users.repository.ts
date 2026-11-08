import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Prisma, User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PublicUser } from './dto/user.dto';

/** Password tidak pernah ikut di-SELECT, kecuali lewat findByEmailWithPassword. */
const omitPassword = { password: true } as const;

/** Hanya user yang belum di-soft-delete. */
const notDeleted = { deletedAt: null } satisfies Prisma.UserWhereInput;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<PublicUser | null> {
    return this.prisma.user.findFirst({
      where: { id, ...notDeleted },
      omit: omitPassword,
    });
  }

  findByEmail(email: string): Promise<PublicUser | null> {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), ...notDeleted },
      omit: omitPassword,
    });
  }

  /** Ikut mengambil hash password. Hanya untuk proses login. */
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), ...notDeleted },
    });
  }

  findPaginated(query: PaginationQueryDto): Promise<[PublicUser[], number]> {
    const search = query.search?.trim();
    const where: Prisma.UserWhereInput = {
      ...notDeleted,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    return this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        omit: omitPassword,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);
  }

  create(data: Prisma.UserCreateInput): Promise<PublicUser> {
    return this.prisma.user.create({ data, omit: omitPassword });
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<PublicUser> {
    return this.prisma.user.update({
      where: { id },
      data,
      omit: omitPassword,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
