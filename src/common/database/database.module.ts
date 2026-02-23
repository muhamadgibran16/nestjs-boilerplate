import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig, { typeOrmDataSourceOptions } from './typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forRoot(typeOrmDataSourceOptions),
  ],
})
export class DatabaseModule {}
