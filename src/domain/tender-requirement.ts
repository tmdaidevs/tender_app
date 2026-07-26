import { z } from "zod";

export const requirementCategorySchema = z.enum([
  "classification",
  "geography",
  "commercial",
  "eligibility",
  "experience",
  "personnel",
  "submission",
  "security",
  "sustainability",
  "participation",
  "contract",
  "other",
]);

export const requirementKeySchema = z.enum([
  "cpv_code",
  "delivery_country",
  "nuts_region",
  "on_site_delivery",
  "data_residency",
  "contract_value",
  "minimum_turnover",
  "insurance_coverage",
  "certification",
  "license",
  "professional_registration",
  "exclusion_declaration",
  "reference_project",
  "personnel_role",
  "personnel_experience",
  "personnel_capacity",
  "submission_language",
  "submission_deadline",
  "submission_method",
  "procurement_platform",
  "electronic_signature",
  "document_format",
  "security_clearance",
  "gdpr",
  "accessibility_standard",
  "environmental_policy",
  "social_policy",
  "consortium",
  "subcontracting",
  "lots",
  "contract_duration",
  "framework_agreement",
  "other",
]);

export const requirementValueSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), value: z.string().max(2000) }),
  z.object({ type: z.literal("boolean"), value: z.boolean() }),
  z.object({
    type: z.literal("number"),
    amount: z.number(),
    unit: z.string().max(50).nullable(),
  }),
  z.object({
    type: z.literal("money"),
    amount: z.number().nonnegative(),
    currency: z.string().length(3),
  }),
  z.object({
    type: z.literal("codes"),
    codes: z.array(z.string().max(100)).min(1).max(100),
  }),
  z.object({ type: z.literal("date"), value: z.string().max(100) }),
]);

export const normalizedTenderRequirementSchema = z.object({
  id: z.string().min(1).max(160),
  category: requirementCategorySchema,
  key: requirementKeySchema,
  title: z.string().min(1).max(500),
  description: z.string().max(2000).nullable(),
  mandatory: z.boolean().nullable(),
  operator: z.enum([
    "equals",
    "includes_any",
    "includes_all",
    "minimum",
    "maximum",
    "before",
    "after",
    "supports",
    "informational",
  ]),
  value: requirementValueSchema,
  source: z.object({
    kind: z.enum(["official_notice", "buyer_published", "ai_extraction"]),
    url: z.string().url(),
    path: z.string().min(1).max(500),
    excerpt: z.string().max(1200).nullable(),
  }),
  verificationStatus: z.enum(["official", "buyer_confirmed", "candidate", "rejected"]),
});

export const aiRequirementCandidateSchema = normalizedTenderRequirementSchema.extend({
  source: normalizedTenderRequirementSchema.shape.source.extend({
    kind: z.literal("ai_extraction"),
  }),
  verificationStatus: z.literal("candidate"),
});

export type NormalizedTenderRequirement = z.infer<typeof normalizedTenderRequirementSchema>;

export function normalizeOfficialTenderConstraints(input: {
  sourceUrl: string;
  cpvCodes: string[];
  countryCodes: string[];
  estimatedValue: number | null;
  currency: string | null;
  deadlineAt: string | null;
}): NormalizedTenderRequirement[] {
  const requirements: NormalizedTenderRequirement[] = [];
  if (input.cpvCodes.length > 0) {
    requirements.push({
      id: "official-classification-cpv",
      category: "classification",
      key: "cpv_code",
      title: "Official CPV classification",
      description: "Classification assigned by the contracting authority.",
      mandatory: null,
      operator: "includes_any",
      value: { type: "codes", codes: input.cpvCodes },
      source: {
        kind: "official_notice",
        url: input.sourceUrl,
        path: "TED Search API: classification-cpv",
        excerpt: null,
      },
      verificationStatus: "official",
    });
  }
  if (input.countryCodes.length > 0) {
    requirements.push({
      id: "official-place-of-performance",
      category: "geography",
      key: "delivery_country",
      title: "Place of performance",
      description: "Officially published country or countries of performance.",
      mandatory: null,
      operator: "includes_any",
      value: { type: "codes", codes: input.countryCodes },
      source: {
        kind: "official_notice",
        url: input.sourceUrl,
        path: "TED Search API: place-of-performance",
        excerpt: null,
      },
      verificationStatus: "official",
    });
  }
  if (input.estimatedValue !== null && input.currency !== null) {
    requirements.push({
      id: "official-estimated-contract-value",
      category: "commercial",
      key: "contract_value",
      title: "Estimated contract value",
      description: "Value disclosed by the official source; it is not a supplier threshold.",
      mandatory: null,
      operator: "informational",
      value: { type: "money", amount: input.estimatedValue, currency: input.currency },
      source: {
        kind: "official_notice",
        url: input.sourceUrl,
        path: "TED Search API: estimated-value-proc / estimated-value-lot",
        excerpt: null,
      },
      verificationStatus: "official",
    });
  }
  if (input.deadlineAt !== null) {
    requirements.push({
      id: "official-submission-deadline",
      category: "submission",
      key: "submission_deadline",
      title: "Submission deadline",
      description: "Official deadline currently stored for the notice.",
      mandatory: true,
      operator: "before",
      value: { type: "date", value: input.deadlineAt },
      source: {
        kind: "official_notice",
        url: input.sourceUrl,
        path: "TED Search API: deadline-receipt-tender-date-lot / deadline",
        excerpt: null,
      },
      verificationStatus: "official",
    });
  }
  return requirements;
}
