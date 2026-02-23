import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import typeOrmConfig from './typeorm.config';

config();

const typeOrmDataSource = new DataSource({
  ...(typeOrmConfig as unknown as DataSourceOptions),
  migrations: ['dist/**/migration/*.js'],
});
export default typeOrmDataSource;
