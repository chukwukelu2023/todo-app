import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dbFile = path.resolve(__dirname, "../prisma/test.db");

/** Creates a fresh SQLite database for the test run from the committed migrations. */
export default function setup() {
  fs.rmSync(dbFile, { force: true });
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "ignore",
  });
  return () => fs.rmSync(dbFile, { force: true });
}
