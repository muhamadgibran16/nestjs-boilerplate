import { AppEnv, validateEnv } from './env.validation';

const base = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/app',
  JWT_SECRET: 'x'.repeat(32),
};

describe('validateEnv', () => {
  it('applies defaults and converts types', () => {
    const env = validateEnv({ ...base, PORT: '4000', DB_LOGGING: 'true' });
    expect(env.PORT).toBe(4000);
    expect(env.DB_LOGGING).toBe(true);
    expect(env.NODE_ENV).toBe(AppEnv.DEVELOPMENT);
  });

  it('treats empty strings as unset', () => {
    expect(validateEnv({ ...base, PORT: '' }).PORT).toBe(3000);
  });

  it('fails on a short JWT secret', () => {
    expect(() => validateEnv({ ...base, JWT_SECRET: 'short' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('fails when a required variable is missing', () => {
    const { DATABASE_URL: _omit, ...rest } = base;
    expect(() => validateEnv(rest)).toThrow(/DATABASE_URL/);
  });

  it('fails on a non-PostgreSQL DATABASE_URL', () => {
    expect(() =>
      validateEnv({ ...base, DATABASE_URL: 'mysql://localhost/app' }),
    ).toThrow(/DATABASE_URL/);
  });
});
