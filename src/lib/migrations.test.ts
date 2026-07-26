import { describe, expect, it } from "vitest";
import { splitSqlStatements } from "./migrations";

describe("splitSqlStatements", () => {
  it("keeps procedural blocks intact and splits top-level statements", () => {
    const source = `
      do $$ begin
        create type example as enum ('one', 'two');
      exception when duplicate_object then null; end $$;
      create table if not exists items (id uuid primary key);
    `;
    const statements = splitSqlStatements(source);
    expect(statements).toHaveLength(2);
    expect(statements[0]).toContain("exception when duplicate_object");
    expect(statements[1]).toContain("create table");
  });
});
