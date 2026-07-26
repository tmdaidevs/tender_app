import { z } from "zod";
import { normalizedTenderRequirementSchema } from "./tender-requirement";

const nullableIsoDate = z.string().datetime().nullable();

/**
 * The source-neutral contract used by every tender detail API and page.
 * Connectors may retain their complete upstream record in source.record, but
 * must map marketplace fields into this schema before persistence or display.
 */
export const canonicalTenderSchema = z.object({
  schemaVersion: z.literal("1.0"),
  id: z.string().uuid(),
  title: z.string().min(1),
  summary: z.string().nullable(),
  noticeType: z.string().nullable(),
  status: z.string(),
  lane: z.string(),
  buyer: z.object({
    name: z.string().nullable(),
  }),
  classifications: z.object({
    cpvCodes: z.array(z.string()),
  }),
  placesOfPerformance: z.array(
    z.object({
      countryCode: z.string(),
    }),
  ),
  requirements: z.array(normalizedTenderRequirementSchema).max(300).default([]),
  value: z
    .object({
      amount: z.number(),
      currency: z.string().length(3),
    })
    .nullable(),
  dates: z.object({
    publishedAt: nullableIsoDate,
    deadlineAt: nullableIsoDate,
    retrievedAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
  source: z.object({
    code: z.string(),
    name: z.string(),
    official: z.boolean(),
    baseUrl: z.string().url(),
    noticeIdentifier: z.string(),
    noticeUrl: z.string().url(),
    record: z.record(z.unknown()),
  }),
  provenance: z.object({
    latestVersion: z.number().int().positive().nullable(),
    latestVersionCreatedAt: nullableIsoDate,
    contentHash: z.string().nullable(),
  }),
});

export type CanonicalTender = z.infer<typeof canonicalTenderSchema>;
