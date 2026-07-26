import { describe, expect, it } from "vitest";
import {
  companyProfileCompletion,
  companyProfileSchema,
  emptyCompanyProfile,
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
});
