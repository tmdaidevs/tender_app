import { describe, expect, it } from "vitest";
import { canonicalTenderSchema } from "./canonical-tender";

describe("canonicalTenderSchema", () => {
  it("preserves normalized fields and the attributed source record", () => {
    const parsed = canonicalTenderSchema.parse({
      schemaVersion: "1.0",
      id: "2bc4ffb2-2a93-4ba8-adf6-20b13d23657c",
      title: "Cloud services",
      summary: "Official description",
      noticeType: "Competition",
      status: "published",
      lane: "public_import",
      buyer: { name: "Public authority" },
      classifications: { cpvCodes: ["72000000"] },
      placesOfPerformance: [{ countryCode: "DE" }],
      value: { amount: 125000, currency: "EUR" },
      dates: {
        publishedAt: "2026-07-20T00:00:00.000Z",
        deadlineAt: "2026-08-20T12:00:00.000Z",
        retrievedAt: "2026-07-26T14:00:00.000Z",
        updatedAt: "2026-07-26T14:00:00.000Z",
      },
      source: {
        code: "ted-eu",
        name: "Tenders Electronic Daily (TED)",
        official: true,
        baseUrl: "https://ted.europa.eu",
        noticeIdentifier: "123456-2026",
        noticeUrl: "https://ted.europa.eu/en/notice/-/detail/123456-2026",
        record: { "publication-number": "123456-2026" },
      },
      provenance: {
        latestVersion: 1,
        latestVersionCreatedAt: "2026-07-26T14:00:00.000Z",
        contentHash: "abc123",
      },
    });

    expect(parsed.schemaVersion).toBe("1.0");
    expect(parsed.source.record["publication-number"]).toBe("123456-2026");
    expect(parsed.requirements).toEqual([]);
  });

  it("rejects incomplete connector output", () => {
    expect(() => canonicalTenderSchema.parse({ schemaVersion: "1.0" })).toThrow();
  });
});
