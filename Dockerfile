# syntax=docker/dockerfile:1
# Brother Bear Moving — production image (Next.js 16 + Prisma + SQLite)
FROM node:22-bookworm-slim

# System deps: openssl for Prisma; build tools as a fallback for native modules
# (better-sqlite3 usually ships prebuilt binaries, but keep the toolchain to be safe).
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies (dev deps included — needed for the build and for
# `prisma migrate deploy` / seeding at container start).
COPY package.json package-lock.json ./
RUN npm ci

# App source
COPY . .

# Generate the Prisma client and build the app. A throwaway DB URL keeps the
# build steps happy; the real one is injected at runtime.
ENV DATABASE_URL="file:/tmp/build.db"
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Runs migrations, seeds an empty DB, then starts the server.
CMD ["sh", "docker-entrypoint.sh"]
