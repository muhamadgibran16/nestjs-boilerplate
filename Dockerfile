# syntax=docker/dockerfile:1
#
# Target:
#   runtime (default) -> image aplikasi, ramping (tanpa Prisma CLI)
#   migrate           -> job sekali jalan: `prisma migrate deploy`
#
#   docker build -t app .
#   docker build -t app-migrate --target migrate .

FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# Versi pnpm mengikuti field "packageManager" di package.json.
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .pnpmfile.cjs ./

# ---- Semua dependency + build ----
FROM base AS build
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm db:generate && pnpm build

# ---- Migration job ----
# Hanya berisi Prisma CLI + dotenv (versi diambil dari package.json) dan folder prisma/.
FROM node:24-alpine AS migrate
# openssl dibutuhkan schema engine Prisma.
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json /tmp/package.json
RUN PRISMA_VERSION=$(node -p "require('/tmp/package.json').devDependencies.prisma") \
 && DOTENV_VERSION=$(node -p "require('/tmp/package.json').dependencies.dotenv") \
 && echo '{"private":true}' > package.json \
 && npm install --no-audit --no-fund "prisma@${PRISMA_VERSION}" "dotenv@${DOTENV_VERSION}" \
 && npm cache clean --force \
 && rm /tmp/package.json \
 && chown -R node:node /app
COPY --chown=node:node prisma.config.ts ./
COPY --chown=node:node prisma ./prisma
ENV NODE_ENV=production
USER node
CMD ["node_modules/.bin/prisma", "migrate", "deploy"]

# ---- Dependency production saja ----
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts \
 # Buang file yang tidak dipakai saat runtime:
 # - source map
 # - query compiler Prisma untuk database selain PostgreSQL, varian "small", dan versi ESM
 && find node_modules/ -name '*.map' -type f -delete \
 && find node_modules/.pnpm/@prisma+client@*/node_modules/@prisma/client/runtime -type f \
      \( -name 'query_compiler_small_*' -o -name 'query_compiler_*.mjs' \
         -o -name '*sqlserver*' -o -name '*cockroachdb*' -o -name '*mysql*' -o -name '*sqlite*' \) \
      -delete

# ---- Runtime ----
FROM node:24-alpine AS runtime
RUN apk add --no-cache tzdata
ENV NODE_ENV=production \
    TZ=Asia/Jakarta \
    PORT=3000
WORKDIR /app

COPY --from=build --chown=node:node /app/package.json ./
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/v1/health" > /dev/null || exit 1

# Migration TIDAK dijalankan di sini; jalankan target `migrate` lebih dulu saat deploy.
CMD ["node", "dist/main.js"]
