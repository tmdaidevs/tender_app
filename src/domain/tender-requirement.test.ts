import { describe, expect, it } from "vitest";
import {
  aiRequirementCandidateSchema,
  normalizeOfficialTenderConstraints,
} from "./tender-requirement";

describe("normalized tender requirements", () => {
  it("maps official source fields without turning informational facts into hard gates", () => {
    const requirements = normalizeOfficialTenderConstraints({
      sourceUrl: "https://ted.europa.eu/en/notice/-/detail/123456-2026",
      cpvCodes: ["72000000"],
      countryCodes: ["DE"],
      estimatedValue: 250_000,
      currency: "EUR",
      deadlineAt: "2026-08-20T10:00:00.000Z",
    });
    expect(requirements).toHaveLength(4);
    expect(requirements.find((item) => item.key === "contract_value")?.mandatory).toBeNull();
    expect(requirements.find((item) => item.key === "submission_deadline")?.mandatory).toBe(true);
    expect(requirements.every((item) => item.verificationStatus === "official")).toBe(true);
  });

  it("prevents AI candidates from claiming official verification", () => {
    expect(() => aiRequirementCandidateSchema.parse({
      id: "candidate-1",
      category: "eligibility",
      key: "certification",
      title: "ISO 27001",
      description: null,
      mandatory: true,
      operator: "includes_all",
      value: { type: "codes", codes: ["ISO 27001"] },
      source: {
        kind: "official_notice",
        url: "https://ted.europa.eu/en/notice/123/xml",
        path: "cac:TechnicalProfessionalAbility",
        excerpt: null,
      },
      verificationStatus: "official",
    })).toThrow();
  });
});
