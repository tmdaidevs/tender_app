import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const migration = await readFile(
  new URL("../database/migrations/0001_neon_foundation.sql", import.meta.url),
  "utf8",
);

await neon(databaseUrl).query(migration);
console.log("Applied Neon foundation migration.");
