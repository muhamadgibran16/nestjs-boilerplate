import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { HealthIndicatorService } from '@nestjs/terminus';
import { sql } from 'drizzle-orm';
import { Database } from './database.types';

/** Health indicator untuk terminus: cek database dengan `SELECT 1`. */
@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly healthIndicator: HealthIndicatorService,
    @InjectDrizzle() private readonly db: Database,
  ) {}

  async pingCheck(key: string) {
    const indicator = this.healthIndicator.check(key);
    try {
      await this.db.execute(sql`SELECT 1`);
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
