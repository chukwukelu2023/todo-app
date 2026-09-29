import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** Everything except comments and the datasource block, which is the only intended difference. */
function models(file: string) {
  return fs
    .readFileSync(path.resolve(__dirname, "..", file), "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/^\/\/.*\n/gm, "")
    .replace(/datasource db \{[^}]*\}/, "")
    .trim();
}

describe("prisma schemas", () => {
  it("keep SQLite and PostgreSQL models identical", () => {
    expect(models("prisma/postgres/schema.prisma")).toBe(models("prisma/schema.prisma"));
  });
});
