import { z } from "zod";

export const eligibilityInputSchema = z.object({
  operatingCountries: z.array(z.string()),
  requiredCountry: z.string(),
  certifications: z.array(z.string()),
  requiredCertifications: z.array(z.string()),
  maximumContractValue: z.number().nonnegative(),
  estimatedValue: z.number().nonnegative(),
});

export type EligibilityResult = {
  eligible: boolean;
  reasons: string[];
};

export function evaluateEligibility(input: z.infer<typeof eligibilityInputSchema>): EligibilityResult {
  const value = eligibilityInputSchema.parse(input);
  const reasons: string[] = [];

  if (!value.operatingCountries.includes(value.requiredCountry)) {
    reasons.push(`Supplier does not operate in ${value.requiredCountry}`);
  }
  for (const certification of value.requiredCertifications) {
    if (!value.certifications.includes(certification)) {
      reasons.push(`Missing mandatory certification: ${certification}`);
    }
  }
  if (value.estimatedValue > value.maximumContractValue) {
    reasons.push("Estimated contract value exceeds supplier capacity");
  }
  return { eligible: reasons.length === 0, reasons };
}

export function calculateFitScore(components: {
  capability: number;
  evidence: number;
  geography: number;
  capacity: number;
}): number {
  const weighted =
    components.capability * 0.4 +
    components.evidence * 0.3 +
    components.geography * 0.15 +
    components.capacity * 0.15;
  return Math.round(Math.max(0, Math.min(100, weighted)));
}
