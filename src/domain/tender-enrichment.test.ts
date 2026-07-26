import { describe, expect, it } from "vitest";
import { tenderEnrichmentSchema } from "./tender-enrichment";

const validEnrichment = {
  language: "de",
  executiveSummary: "Eine belegte Zusammenfassung.",
  scope: [{ text: "Beratungsleistungen", sourcePath: "cac:ProcurementProject" }],
  deliverables: [],
  eligibilityRequirements: [],
  submissionRequirements: [],
  procedure: {
    procedureType: "Open",
    contractNature: "Services",
    submissionMethod: null,
    submissionLanguages: ["DE"],
    lotCount: 1,
    frameworkAgreement: null,
    sourcePaths: ["cac:TenderingProcess"],
  },
  buyer: {
    name: "Example authority",
    address: null,
    contactEmail: null,
    contactPhone: null,
    website: null,
    sourcePaths: ["cac:ContractingParty"],
  },
  timeline: [],
  commercial: {
    estimatedValue: null,
    duration: null,
    renewal: null,
    paymentTerms: null,
    sourcePaths: [],
  },
  awardCriteria: [],
  contractTerms: [],
  risksAndClarifications: [{
    title: "Value not disclosed",
    detail: "Confirm the expected contract volume.",
    basis: "missing_information",
    sourcePath: null,
  }],
  sourceReview: {
    documentLanguage: "de",
    materialLimitations: [],
  },
} as const;

describe("tenderEnrichmentSchema", () => {
  it("accepts evidence-backed structured enrichment", () => {
    const result = tenderEnrichmentSchema.parse(validEnrichment);
    expect(result.scope[0].sourcePath).toBe("cac:ProcurementProject");
  });

  it("rejects unsupported risk classifications", () => {
    expect(() => tenderEnrichmentSchema.parse({
      ...validEnrichment,
      risksAndClarifications: [{
        title: "Unsupported",
        detail: "Unsupported",
        basis: "guess",
        sourcePath: null,
      }],
    })).toThrow();
  });
});
