import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleModule } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { AppConfig } from '../config/configuration';
import * as schema from './schema';

/**
 * Koneksi database lewat modul resmi @nestjs/drizzle (https://docs.nestjs.com/data/drizzle).
 * DrizzleModule bersifat global: `@InjectDrizzle()` bisa dipakai di modul mana pun.
 * Modul ini juga menutup pool saat shutdown dan menangani error koneksi pool
 * (misalnya Postgres restart) agar aplikasi tidak crash.
 */
@Module({
  imports: [
    DrizzleModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const db = config.get('database', { infer: true });
        const logger = new Logger('Drizzle');
        return {
          drizzle,
          connection: { connectionString: db.url, max: db.poolMax },
          schema,
          logger: db.logging
            ? {
                logQuery: (query: string, params: unknown[]) =>
                  logger.debug({ query, params }),
              }
            : false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
