import { describe, expect, it } from "vitest";
import { tenderListInputSchema } from "./tenders";

describe("tenderListInputSchema", () => {
  it("defaults to the first page with 50 results", () => {
    expect(tenderListInputSchema.parse({})).toMatchObject({ page: 1, limit: 50 });
  });

  it("rejects marketplace pages larger than 50 results", () => {
    expect(tenderListInputSchema.safeParse({ limit: 51 }).success).toBe(false);
  });
});
