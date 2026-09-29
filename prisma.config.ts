import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma can't read the datasource provider from an env var, so there is one
 * schema per database and this picks it from the DATABASE_URL scheme:
 *   file:./dev.db             -> SQLite   (local development)
 *   postgres://… / postgresql://… -> PostgreSQL (deployment)
 */
function selectDatabase(url: string | undefined) {
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
  if (/^postgres(ql)?:\/\//.test(url)) return "postgres";
  if (url.startsWith("file:")) return "sqlite";
  throw new Error(`Unsupported DATABASE_URL scheme: ${url.split(":")[0]}: (use file: or postgres://)`);
}

const dir = selectDatabase(process.env.DATABASE_URL) === "postgres" ? "prisma/postgres" : "prisma";

export default defineConfig({
  schema: `${dir}/schema.prisma`,
  migrations: {
    path: `${dir}/migrations`,
    seed: "tsx prisma/seed.ts",
  },
});
