import { readdir, readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

function splitSqlStatements(source) {
  const statements = [];
  let current = "";
  let singleQuoted = false;
  let doubleQuoted = false;
  let dollarQuoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (!singleQuoted && !doubleQuoted && character === "$" && next === "$") {
      dollarQuoted = !dollarQuoted;
      current += "$$";
      index += 1;
      continue;
    }
    if (!dollarQuoted && !doubleQuoted && character === "'") {
      if (singleQuoted && next === "'") {
        current += "''";
        index += 1;
        continue;
      }
      singleQuoted = !singleQuoted;
    } else if (!dollarQuoted && !singleQuoted && character === '"') {
      doubleQuoted = !doubleQuoted;
    }
    if (character === ";" && !singleQuoted && !doubleQuoted && !dollarQuoted) {
      if (current.trim()) statements.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

const sql = neon(databaseUrl);
const migrationDirectory = new URL("../database/migrations/", import.meta.url);
const migrationFiles = (await readdir(migrationDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();

for (const migrationFile of migrationFiles) {
  const migration = await readFile(new URL(migrationFile, migrationDirectory), "utf8");
  for (const statement of splitSqlStatements(migration)) {
    await sql.query(statement);
  }
  console.log(`Applied ${migrationFile}.`);
}
