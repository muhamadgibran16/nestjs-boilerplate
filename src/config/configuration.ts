import { AppEnv, EnvironmentVariables } from './env.validation';

/**
 * Konfigurasi terstruktur yang dibaca lewat `ConfigService<AppConfig, true>`.
 * Contoh: `config.get('jwt.secret', { infer: true })`.
 */
export const buildConfig = (env: EnvironmentVariables) => ({
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === AppEnv.PRODUCTION,
  port: env.PORT,
  corsOrigin:
    env.CORS_ORIGIN === '*'
      ? true
      : env.CORS_ORIGIN.split(',').map((o) => o.trim()),
  swaggerEnabled: env.SWAGGER_ENABLED ?? env.NODE_ENV !== AppEnv.PRODUCTION,
  database: {
    url: env.DATABASE_URL,
    poolMax: env.DB_POOL_MAX,
    logging: env.DB_LOGGING,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  throttle: {
    ttl: env.THROTTLE_TTL,
    limit: env.THROTTLE_LIMIT,
  },
});

export type AppConfig = ReturnType<typeof buildConfig>;

/** File .env yang dibaca (urutan pertama paling diprioritaskan). */
export const ENV_FILE_PATHS = ['.env', '/volume/.env'];
