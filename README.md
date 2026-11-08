<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# NestJS Boilerplate

REST API starter: **NestJS 11 · PostgreSQL + Prisma 7 · JWT · Role-based access · Swagger · Docker**

## Mulai

Butuh Node.js ≥ 20, Docker, dan pnpm (aktifkan sekali dengan `corepack enable`).

```bash
pnpm install
cp .env.example .env            # isi JWT_SECRET (min. 32 karakter)
docker compose up -d postgres
pnpm db:deploy                  # terapkan migration
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=ganti-password pnpm seed:admin
pnpm start:dev
```

API berjalan di `http://localhost:3000/api/v1`, Swagger di `http://localhost:3000/docs`.

## Auth

| Endpoint                          | Akses      |
| --------------------------------- | ---------- |
| `POST /auth/register`, `/login`   | publik     |
| `GET /auth/me`                    | user login |
| `GET/POST/PATCH/DELETE /users`    | admin      |
| `GET /health`                     | publik     |

Kirim token lewat header `Authorization: Bearer <token>`. Semua route wajib login secara default. Atur aksesnya dengan decorator:

```ts
@Public()             // tanpa login
@Roles(Role.ADMIN)    // khusus admin
@CurrentUser() user   // payload JWT { sub, email, role }
```

## Format response

```jsonc
// Sukses ("meta" hanya muncul jika service mengembalikan new Paginated(...))
{ "success": true, "statusCode": 200, "message": "OK", "data": {}, "meta": {} }

// Error
{ "success": false, "statusCode": 400, "message": "Validation failed", "errors": [], "path": "...", "timestamp": "..." }
```

Isi `message` bisa diatur dengan `@ResponseMessage('...')`.

## Database

Skema database didefinisikan di `prisma/schema.prisma`. Setiap perubahan dibuat lewat migration:

```bash
pnpm db:migrate --name tambah_tabel_x   # buat migration dari perubahan schema + terapkan (dev)
pnpm db:deploy                          # terapkan migration yang belum jalan (production/CI)
pnpm db:status                          # cek status migration
pnpm db:studio                          # GUI untuk melihat isi database
```

Prisma Client di-generate otomatis ke `src/generated/prisma` saat `pnpm install` dan `pnpm db:migrate`. Folder ini tidak di-commit. Kalau muncul error tipe setelah mengubah schema, jalankan `pnpm db:generate`.

Soft delete dilakukan manual: repository selalu memfilter `deletedAt: null`. Untuk model baru, salin kolom standar dari model `User` (`id`, `createdAt`, `updatedAt`, `deletedAt`).

## Struktur

```
src/
├── auth/              # register/login, JwtAuthGuard & RolesGuard (global)
├── users/             # repository, service, controller, dto (admin)
├── prisma/            # PrismaModule & PrismaService (global)
├── generated/         # Prisma Client hasil generate (tidak di-commit)
├── health/            # endpoint health check (terminus)
├── config/            # validasi & struktur environment variable
├── common/
│   ├── decorators/    # @Public, @Roles, @CurrentUser, @ResponseMessage
│   ├── dto/           # PaginationQueryDto
│   ├── filters/       # AllExceptionsFilter
│   ├── interceptors/  # TransformInterceptor
│   ├── middleware/    # RequestLoggerMiddleware
│   ├── pagination/    # Paginated<T>
│   └── transformers/  # trim, normalizeEmail
├── cli/               # create-admin (seed)
├── bootstrap.ts       # setup global (dipakai main.ts & test e2e)
└── main.ts

prisma/
├── schema.prisma      # definisi model & enum
└── migrations/        # file migration SQL
prisma.config.ts       # konfigurasi Prisma CLI
```

**Menambah modul baru** (misalnya `products`): ikuti pola `users/`, yaitu module, controller, service, repository, dan dto. Tambahkan model di `schema.prisma`, jalankan `pnpm db:migrate --name nama_perubahan`, lalu daftarkan module-nya di `app.module.ts`.

## Test

```bash
pnpm test        # unit test
pnpm test:e2e    # butuh database app_test, isinya akan DIHAPUS
```

## Docker

Dockerfile punya dua target:

| Target              | Isi                                   | Ukuran  |
| ------------------- | ------------------------------------- | ------- |
| `runtime` (default) | aplikasi, tanpa Prisma CLI            | ±316 MB |
| `migrate`           | job `prisma migrate deploy`, lalu exit | ±616 MB |

```bash
docker compose --profile app up -d --build   # postgres → migrate → app
```

Deploy manual: jalankan migration dulu, baru aplikasi.

```bash
docker build -t app . && docker build -t app-migrate --target migrate .
docker run --rm -e DATABASE_URL=... app-migrate
docker run -d --env-file .env -p 3000:3000 app
```

Image dibuat kecil dengan dua cara. `.pnpmfile.cjs` mencegah Prisma CLI ikut terpasang di dependency production, dan Dockerfile membuang query compiler Prisma untuk database selain PostgreSQL.

## Catatan

- Environment variable divalidasi saat startup. Daftarnya ada di `.env.example`. Kalau menambah variabel, update juga `src/config/`.
- Selalu commit `pnpm-lock.yaml`. Lint dan format berjalan otomatis saat commit (husky).

## Author

**Muhamad Gibran** — [@muhamadgibran16](https://github.com/muhamadgibran16)

Issues and pull requests are welcome at
[github.com/muhamadgibran16/nestjs-boilerplate](https://github.com/muhamadgibran16/nestjs-boilerplate).