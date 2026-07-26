import { z } from "zod";

const supportedFact = z.object({
  text: z.string().min(1).max(1200),
  sourcePath: z.string().min(1).max(300),
});

export const tenderEnrichmentSchema = z.object({
  language: z.enum(["de", "en"]),
  executiveSummary: z.string().min(1).max(3000),
  scope: z.array(supportedFact).max(20),
  deliverables: z.array(supportedFact).max(20),
  eligibilityRequirements: z.array(supportedFact).max(20),
  submissionRequirements: z.array(supportedFact).max(20),
  procedure: z.object({
    procedureType: z.string().max(300).nullable(),
    contractNature: z.string().max(300).nullable(),
    submissionMethod: z.string().max(500).nullable(),
    submissionLanguages: z.array(z.string().max(100)).max(20),
    lotCount: z.number().int().nonnegative().nullable(),
    frameworkAgreement: z.string().max(500).nullable(),
    sourcePaths: z.array(z.string().max(300)).max(20),
  }),
  buyer: z.object({
    name: z.string().max(500).nullable(),
    address: z.string().max(1000).nullable(),
    contactEmail: z.string().max(320).nullable(),
    contactPhone: z.string().max(100).nullable(),
    website: z.string().max(500).nullable(),
    sourcePaths: z.array(z.string().max(300)).max(20),
  }),
  timeline: z.array(
    z.object({
      label: z.string().min(1).max(300),
      date: z.string().max(100).nullable(),
      detail: z.string().max(1000).nullable(),
      sourcePath: z.string().min(1).max(300),
    }),
  ).max(30),
  commercial: z.object({
    estimatedValue: z.string().max(300).nullable(),
    duration: z.string().max(500).nullable(),
    renewal: z.string().max(1000).nullable(),
    paymentTerms: z.string().max(1000).nullable(),
    sourcePaths: z.array(z.string().max(300)).max(20),
  }),
  awardCriteria: z.array(
    z.object({
      criterion: z.string().min(1).max(1000),
      weight: z.string().max(100).nullable(),
      sourcePath: z.string().min(1).max(300),
    }),
  ).max(30),
  contractTerms: z.array(supportedFact).max(20),
  risksAndClarifications: z.array(
    z.object({
      title: z.string().min(1).max(300),
      detail: z.string().min(1).max(1200),
      basis: z.enum(["source_fact", "missing_information", "inference"]),
      sourcePath: z.string().max(300).nullable(),
    }),
  ).max(15),
  sourceReview: z.object({
    documentLanguage: z.string().max(100).nullable(),
    materialLimitations: z.array(z.string().max(500)).max(15),
  }),
});

export type TenderEnrichment = z.infer<typeof tenderEnrichmentSchema>;

export type TenderEnrichmentRecord = {
  id: string;
  status: "complete";
  model: string;
  promptVersion: string;
  sourceDocumentUrl: string;
  sourceContentHash: string;
  sourceTenderVersion: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  completedAt: string;
  result: TenderEnrichment;
};
