/**
 * Membuat (atau mempromosikan) user admin pertama.
 *
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret123 pnpm seed:admin
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Role } from '../users/enums/role.enum';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Administrator';

  if (!email || !password || password.length < 8) {
    throw new Error('Set ADMIN_EMAIL dan ADMIN_PASSWORD (minimal 8 karakter).');
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    const repo = app.get(UsersRepository);
    const existing = await repo.findByEmail(email);
    if (existing) {
      await repo.update(existing.id, { role: Role.ADMIN, isActive: true });
      console.log(`User ${email} dipromosikan menjadi admin.`);
    } else {
      await app
        .get(UsersService)
        .create({ name, email, password, role: Role.ADMIN });
      console.log(`Admin ${email} berhasil dibuat.`);
    }
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
