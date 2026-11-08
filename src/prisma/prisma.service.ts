import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppConfig } from '../config/configuration';
import { PrismaClient } from '../generated/prisma/client';

/**
 * Prisma Client sebagai provider NestJS. Inject di repository:
 * `constructor(private readonly prisma: PrismaService) {}`
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService<AppConfig, true>) {
    const db = config.get('database', { infer: true });
    super({
      adapter: new PrismaPg({ connectionString: db.url }),
      log: db.logging ? ['query', 'warn', 'error'] : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
