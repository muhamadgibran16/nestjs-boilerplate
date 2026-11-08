# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
# openssl dibutuhkan schema engine Prisma (prisma migrate).
RUN apk add --no-cache openssl
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# Versi pnpm mengikuti field "packageManager" di package.json.
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma

# ---- Build (semua dependency) ----
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm db:generate && pnpm build

# ---- Dependency production saja ----
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

# ---- Runtime ----
FROM node:24-alpine AS runtime
RUN apk add --no-cache openssl tzdata
ENV NODE_ENV=production \
    TZ=Asia/Jakarta \
    PORT=3000
WORKDIR /app

COPY --from=build --chown=node:node /app/package.json /app/prisma.config.ts ./
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/v1/health" > /dev/null || exit 1

# Terapkan migration lalu start app. `exec` agar node menerima SIGTERM (graceful shutdown).
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && exec node dist/main.js"]
