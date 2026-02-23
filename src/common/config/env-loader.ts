import * as dotenv from 'dotenv';
dotenv.config();

try {
  dotenv.config();
} catch {}

try {
  dotenv.config({ path: '/volume/.env' });
} catch {}

export enum AppEnv {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  TEST = 'test',
  LOCAL = 'local',
}

/**
 * Environment variables wrapper, jangan lupa update ini jika ada penambahan / perubahan di file .env
 * @returns
 */
export const EnvironmentVariablesLoader = () => ({
  NODE_ENV: process.env.NODE_ENV as AppEnv,
  host: process.env.HOSTNAME,
  port: process.env.PORT,
  database: {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: +process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
  },
  jwt: {
    secretKey: process.env.SECRET_KEY,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
});

export const config = EnvironmentVariablesLoader();
