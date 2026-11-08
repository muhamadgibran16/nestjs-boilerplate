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

Starter REST API dengan NestJS 11, PostgreSQL + TypeORM, autentikasi JWT, dan role-based access control.

## Fitur

- **Auth**: register, login, `GET /auth/me`. Password di-hash dengan bcrypt, dan login punya proteksi timing attack.
- **Otorisasi**: `JwtAuthGuard` aktif secara global (pakai `@Public()` untuk route terbuka), ditambah `@Roles(Role.ADMIN)`.
- **Users CRUD** khusus admin, dengan pagination, pencarian, dan soft delete.
- **Response konsisten** untuk sukses maupun error (lihat [Format response](#format-response)).
- **Validasi env** saat startup: aplikasi langsung gagal jika konfigurasi salah.
- **Keamanan**: Helmet, CORS yang bisa dikonfigurasi, rate limit global (lebih ketat di endpoint auth), dan `ValidationPipe` dengan whitelist.
- **Migration TypeORM** (tanpa `synchronize` di production).
- **Swagger** di `/docs` (otomatis nonaktif di production).
- **Health check** di `/api/v1/health`.
- **Docker** multi-stage (non-root, healthcheck, migration otomatis saat start).
- **Test**: unit test + e2e terhadap database sungguhan.
- **Husky + lint-staged**: ESLint & Prettier dijalankan saat commit.

## Prasyarat

- Node.js 20 atau lebih baru
- pnpm, versinya dikunci lewat field `packageManager` di `package.json`. Aktifkan sekali saja dengan:

  ```bash
  corepack enable
  ```

  Setelah itu, perintah `pnpm` di folder ini otomatis memakai versi yang benar.
- Docker (opsional, untuk Postgres lokal)

## Mulai cepat

```bash
pnpm install
cp .env.example .env            # lalu sesuaikan, terutama JWT_SECRET
docker compose up -d postgres   # atau pakai Postgres yang sudah ada
pnpm migration:run
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=ganti-password pnpm seed:admin
pnpm start:dev
```

- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/docs

## Struktur folder

```
src/
├── auth/              # register/login, JwtAuthGuard & RolesGuard (global)
├── users/             # entity, repository, service, controller (admin)
├── health/            # endpoint health check (terminus)
├── config/            # validasi & struktur environment variable
├── common/
│   ├── database/      # DatabaseModule, data-source CLI, migrations/
│   ├── decorators/    # @Public, @Roles, @CurrentUser, @ResponseMessage
│   ├── dto/           # PaginationQueryDto
│   ├── entities/      # AbstractEntity (uuid, timestamps, soft delete)
│   ├── filters/       # AllExceptionsFilter
│   ├── interceptors/  # TransformInterceptor
│   ├── middleware/    # RequestLoggerMiddleware
│   ├── pagination/    # Paginated<T>
│   └── transformers/  # trim, normalizeEmail
├── cli/               # create-admin (seed)
├── bootstrap.ts       # setup global (dipakai main.ts & test e2e)
└── main.ts
```

## Environment variable

Lihat `.env.example`. Semua variabel divalidasi di `src/config/env.validation.ts`. Jika menambah variabel baru, update file tersebut, `src/config/configuration.ts`, dan `.env.example`.

Selain `.env`, aplikasi juga membaca `/volume/.env`, misalnya untuk file konfigurasi yang di-mount saat deployment.

## Database & migration

Perubahan skema **selalu** lewat migration:

```bash
# 1. ubah/ tambah *.entity.ts
# 2. generate migration dari selisih entity vs database
pnpm migration:generate src/common/database/migrations/NamaMigration
# 3. jalankan
pnpm migration:run
# batalkan migration terakhir
pnpm migration:revert
# migration kosong (tulis SQL sendiri)
pnpm migration:create src/common/database/migrations/NamaMigration
```

Entity baru otomatis terdeteksi, asalkan nama filenya `*.entity.ts`. Untuk entity baru, sebaiknya extend `AbstractEntity`.

## Auth & role

| Endpoint                  | Akses       |
| ------------------------- | ----------- |
| `POST /auth/register`     | publik      |
| `POST /auth/login`        | publik      |
| `GET /auth/me`            | user login  |
| `GET/POST/PATCH/DELETE /users` | admin  |
| `GET /health`             | publik      |

Kirim token dengan header `Authorization: Bearer <accessToken>`.

```ts
@Public()                 // tanpa token
@Roles(Role.ADMIN)        // hanya admin
@CurrentUser() user       // payload JWT { sub, email, role }
@CurrentUser('sub') id    // hanya user ID
```

Admin pertama dibuat dengan `pnpm seed:admin` (dev) atau `pnpm seed:admin:prod` (setelah build). Jika email sudah terdaftar, user tersebut dipromosikan menjadi admin.

## Format response

Sukses:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": [ ... ],
  "meta": { "page": 1, "limit": 10, "totalItems": 42, "totalPages": 5, "itemCount": 10 }
}
```

`meta` hanya muncul jika service mengembalikan `new Paginated(...)`. Field `message` bisa diatur dengan `@ResponseMessage('...')`.

Error:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["email must be an email"],
  "path": "/api/v1/auth/register",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## Test

```bash
pnpm test           # unit test
pnpm test:cov       # dengan coverage
pnpm test:e2e       # e2e, butuh Postgres
```

Test e2e memakai `.env.test` dan **menghapus seluruh isi** database `DB_NAME`. Sebagai pengaman, test hanya mau jalan jika nama database berakhiran `_test`. Buat dulu databasenya:

```bash
docker compose exec postgres psql -U postgres -c "create database app_test"
```

## Docker

```bash
docker compose --profile app up -d --build   # postgres + app
```

Atau build image sendiri:

```bash
docker build -t nestjs-boilerplate .
docker run --env-file .env -p 3000:3000 nestjs-boilerplate
```

Saat container start, migration dijalankan lebih dulu, lalu aplikasi. Container berjalan sebagai user non-root dan punya `HEALTHCHECK`.

## Script

| Script                  | Fungsi                                  |
| ----------------------- | --------------------------------------- |
| `start:dev`             | development dengan watch mode           |
| `build` / `start:prod`  | build & jalankan hasil build            |
| `lint` / `format`       | ESLint & Prettier                       |
| `migration:*`           | generate / create / run / revert / show |
| `migration:run:prod`    | jalankan migration dari `dist/`         |
| `seed:admin`            | buat/promosikan admin                   |

Jalankan dengan `pnpm <script>`, misalnya `pnpm lint`.

## Menambah dependency

```bash
pnpm add <paket>          # dependency runtime
pnpm add -D <paket>       # dev dependency
```

Selalu commit `pnpm-lock.yaml`. pnpm bersifat ketat: setiap paket yang di-import di kode wajib tercantum di `package.json`, tidak bisa "numpang" dari dependency lain.

pnpm 10 memblokir install script milik dependency secara default. Jika paket baru butuh build script (misalnya modul native), izinkan dengan `pnpm approve-builds`. Konfigurasinya tersimpan di `pnpm-workspace.yaml`.
