import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from '../config/env-loader';

export const typeOrmDataSourceOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: config.database.DB_HOST,
  port: config.database.DB_PORT,
  username: config.database.DB_USER,
  password: config.database.DB_PASSWORD,
  database: config.database.DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true, // DANGER! Dont set syncronize true in production
  dropSchema: false,
  logging: true,
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  ...typeOrmDataSourceOptions,
  autoLoadEntities: true,
  logging: ['error', 'warn', 'query'],
};

export default typeOrmConfig;
