# syntax=docker/dockerfile:1
#
# Satu image untuk aplikasi dan migration:
#   docker run app                                  -> start aplikasi
#   docker run --rm app node dist/database/migrate.js -> terapkan migration

FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# Versi pnpm mengikuti field "packageManager" di package.json.
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# ---- Build (semua dependency) ----
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build

# ---- Dependency production saja ----
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts \
 && find node_modules/ -name '*.map' -type f -delete

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
# File migration SQL, dibaca oleh dist/database/migrate.js
COPY --from=build --chown=node:node /app/drizzle ./drizzle

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/v1/health" > /dev/null || exit 1

CMD ["node", "dist/main.js"]
