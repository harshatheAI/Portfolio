import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Seeds demo data ONLY when the database is empty (no pricing config yet).
 * Safe to run on every deploy — it never wipes an existing, populated database.
 */
async function run() {
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  let count = 0;
  try {
    count = await prisma.pricingConfig.count();
  } catch {
    count = 0;
  }
  await prisma.$disconnect();

  if (count > 0) {
    console.log(`  Database already populated (${count} pricing config) — skipping seed.`);
    return;
  }

  console.log("  Empty database — seeding demo data…");
  const { seed } = await import("./seed");
  await seed();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
