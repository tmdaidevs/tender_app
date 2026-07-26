import { describe, expect, it } from "vitest";
import { calculateFitScore, evaluateEligibility } from "./matching";

describe("matching", () => {
  it("fails hard gates before scoring", () => {
    const result = evaluateEligibility({
      operatingCountries: ["DE", "AT"],
      requiredCountry: "CH",
      certifications: ["ISO 9001"],
      requiredCertifications: ["ISO 27001"],
      maximumContractValue: 100_000,
      estimatedValue: 180_000,
    });
    expect(result.eligible).toBe(false);
    expect(result.reasons).toHaveLength(3);
  });

  it("calculates a bounded, explainable fit score", () => {
    expect(calculateFitScore({ capability: 90, evidence: 80, geography: 100, capacity: 70 })).toBe(86);
    expect(calculateFitScore({ capability: 150, evidence: 150, geography: 150, capacity: 150 })).toBe(100);
  });
});
