import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';

async function bootstrap() {
  const logger = new Logger('NestApplication');
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new LoggerInterceptor());
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  await app
    .listen(parseInt(process.env.PORT))
    .then(() => {
      logger.log(`Server running at http://localhost:${process.env.PORT}`);
    })
    .catch((error) => {
      logger.error(`Error starting server.`);
      logger.error(error);
    });
}
bootstrap();
