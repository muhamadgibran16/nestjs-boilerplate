import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppConfig } from './config/configuration';

export const API_PREFIX = 'api/v1';

/**
 * Setup global aplikasi. Dipisah dari main.ts agar test e2e memakai
 * konfigurasi yang persis sama dengan production.
 */
export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService<AppConfig, true>);
  const reflector = app.get(Reflector);

  app.use(helmet());
  app.enableCors({ origin: config.get('corsOrigin', { infer: true }) });
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Serializer di luar TransformInterceptor agar @Exclude() pada entity tetap berlaku.
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new TransformInterceptor(reflector),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();
}
