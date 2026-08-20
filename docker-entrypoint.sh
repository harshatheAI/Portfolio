#!/bin/sh
set -e

# Persist the SQLite database on the mounted volume.
# On Railway, add a Volume mounted at /data (this default matches it).
: "${DATABASE_URL:=file:/data/prod.db}"
export DATABASE_URL

# Ensure the directory behind a file: URL exists.
DB_PATH=$(printf '%s' "$DATABASE_URL" | sed -e 's#^file:##')
DB_DIR=$(dirname "$DB_PATH")
mkdir -p "$DB_DIR"

echo "→ Applying database migrations…"
npx prisma migrate deploy

echo "→ Seeding demo data if the database is empty…"
npx tsx prisma/seed-guard.ts || echo "  (seed guard skipped)"

echo "→ Starting Next.js on port ${PORT:-3000}…"
exec node_modules/.bin/next start -p "${PORT:-3000}" -H 0.0.0.0
