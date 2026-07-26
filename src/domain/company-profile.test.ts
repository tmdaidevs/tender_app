import { describe, expect, it } from "vitest";
import {
  companyProfileCompletion,
  companyProfileSchema,
  emptyCompanyProfile,
  sampleCompanyProfile,
} from "./company-profile";

describe("company profile", () => {
  it("accepts the standards-friendly empty draft", () => {
    expect(companyProfileSchema.parse(emptyCompanyProfile)).toEqual(emptyCompanyProfile);
  });

  it("calculates completion from material profile sections", () => {
    expect(companyProfileCompletion(emptyCompanyProfile)).toBe(0);
    expect(companyProfileCompletion({
      ...emptyCompanyProfile,
      identity: { ...emptyCompanyProfile.identity, legalName: "Example GmbH" },
    })).toBeGreaterThan(0);
  });

  it("keeps the generated sample schema-valid and explicitly fictional", () => {
    const sample = companyProfileSchema.parse(sampleCompanyProfile);
    expect(sample.identity.legalName).toContain("Example");
    expect(sample.evidenceSummary[0].claim).toContain("fictional");
  });
});
