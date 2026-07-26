import { z } from "zod";

const text = z.string().max(2000).nullable();
const shortText = z.string().max(500).nullable();

export const companyProfileSchema = z.object({
  identity: z.object({
    legalName: shortText,
    tradingName: shortText,
    legalForm: shortText,
    registrationNumber: shortText,
    vatId: shortText,
    registrationCountry: z.string().max(2).nullable(),
    registeredAddress: text,
    website: z.string().max(1000).nullable(),
    foundingYear: z.number().int().min(1800).max(2200).nullable(),
    employeeCount: z.number().int().nonnegative().nullable(),
    companyDescription: z.string().max(5000).nullable(),
  }),
  contacts: z.array(z.object({
    name: shortText,
    role: shortText,
    email: shortText,
    phone: shortText,
    authorizedSignatory: z.boolean(),
  })).max(20),
  capabilities: z.object({
    services: z.array(z.string().max(500)).max(100),
    industries: z.array(z.string().max(300)).max(50),
    technologies: z.array(z.string().max(300)).max(100),
    cpvCodes: z.array(z.string().max(20)).max(100),
    deliveryCountries: z.array(z.string().max(2)).max(100),
    deliveryModels: z.array(z.string().max(100)).max(20),
  }),
  procurementReadiness: z.object({
    electronicSubmissionReady: z.boolean(),
    platforms: z.array(z.string().max(300)).max(50),
    euLoginAvailable: z.boolean(),
    participantIdentificationCode: shortText,
    qualifiedElectronicSignature: z.boolean(),
    supportedFormats: z.array(z.string().max(50)).max(30),
    tenderLanguages: z.array(z.string().max(3)).max(30),
    defaultTenderValidityDays: z.number().int().nonnegative().nullable(),
    internalApprovalLeadDays: z.number().int().nonnegative().nullable(),
    multipleOffersSupported: z.boolean(),
    consortiumParticipation: z.boolean(),
  }),
  eligibility: z.object({
    exclusionGroundsClear: z.boolean().nullable(),
    taxCompliance: z.boolean().nullable(),
    socialSecurityCompliance: z.boolean().nullable(),
    professionalRegistrations: z.array(z.string().max(500)).max(50),
    licenses: z.array(z.string().max(500)).max(50),
  }),
  certifications: z.array(z.object({
    name: z.string().max(500),
    issuer: shortText,
    certificateNumber: shortText,
    validUntil: shortText,
  })).max(100),
  financial: z.object({
    currencies: z.array(z.string().max(3)).max(20),
    professionalIndemnity: shortText,
    publicLiability: shortText,
    minimumContractValue: shortText,
    maximumContractValue: shortText,
  }),
  team: z.array(z.object({
    role: z.string().max(300),
    skills: z.array(z.string().max(300)).max(50),
    languages: z.array(z.string().max(3)).max(20),
    certifications: z.array(z.string().max(300)).max(30),
  })).max(100),
  references: z.array(z.object({
    client: shortText,
    project: z.string().max(1000),
    description: text,
    services: z.array(z.string().max(300)).max(50),
    outcome: text,
    permissionToDisclose: z.boolean(),
  })).max(100),
  evidenceSummary: z.array(z.object({
    claim: z.string().max(1000),
    sourceLabel: z.string().max(500),
    confidence: z.enum(["high", "medium", "low"]),
  })).max(200),
});

export type CompanyProfile = z.infer<typeof companyProfileSchema>;

export const emptyCompanyProfile: CompanyProfile = {
  identity: {
    legalName: null, tradingName: null, legalForm: null, registrationNumber: null,
    vatId: null, registrationCountry: null, registeredAddress: null, website: null,
    foundingYear: null, employeeCount: null, companyDescription: null,
  },
  contacts: [],
  capabilities: {
    services: [], industries: [], technologies: [], cpvCodes: [],
    deliveryCountries: [], deliveryModels: [],
  },
  procurementReadiness: {
    electronicSubmissionReady: false, platforms: [], euLoginAvailable: false,
    participantIdentificationCode: null, qualifiedElectronicSignature: false,
    supportedFormats: [], tenderLanguages: [], defaultTenderValidityDays: null,
    internalApprovalLeadDays: null, multipleOffersSupported: false,
    consortiumParticipation: false,
  },
  eligibility: {
    exclusionGroundsClear: null, taxCompliance: null, socialSecurityCompliance: null,
    professionalRegistrations: [], licenses: [],
  },
  certifications: [],
  financial: {
    currencies: [], professionalIndemnity: null, publicLiability: null,
    minimumContractValue: null, maximumContractValue: null,
  },
  team: [],
  references: [],
  evidenceSummary: [],
};

export const sampleCompanyProfile: CompanyProfile = {
  identity: {
    legalName: "Example Digital Services GmbH",
    tradingName: "Example Digital",
    legalForm: "Gesellschaft mit beschränkter Haftung (GmbH)",
    registrationNumber: "SAMPLE-HRB-00000",
    vatId: "SAMPLE-DE000000000",
    registrationCountry: "DE",
    registeredAddress: "Sample address — replace before use",
    website: "https://example.com",
    foundingYear: 2018,
    employeeCount: 45,
    companyDescription: "Fictional DACH digital-services supplier profile for exploring TenderLoop. Replace every sample value with verified company evidence before bidding.",
  },
  contacts: [{
    name: "Sample Bid Contact",
    role: "Bid Manager",
    email: "bids@example.com",
    phone: null,
    authorizedSignatory: false,
  }],
  capabilities: {
    services: ["Custom software development", "Cloud consulting", "Data and AI services"],
    industries: ["Public sector", "Professional services"],
    technologies: ["TypeScript", "React", "PostgreSQL", "Cloud platforms"],
    cpvCodes: ["72000000", "72200000", "72300000"],
    deliveryCountries: ["DE", "AT", "CH"],
    deliveryModels: ["Remote", "Hybrid", "On-site"],
  },
  procurementReadiness: {
    electronicSubmissionReady: true,
    platforms: ["eVergabe-Online (sample)"],
    euLoginAvailable: false,
    participantIdentificationCode: null,
    qualifiedElectronicSignature: false,
    supportedFormats: ["PDF/A", "DOCX", "XLSX", "ZIP"],
    tenderLanguages: ["DEU", "ENG"],
    defaultTenderValidityDays: 68,
    internalApprovalLeadDays: 5,
    multipleOffersSupported: true,
    consortiumParticipation: true,
  },
  eligibility: {
    exclusionGroundsClear: null,
    taxCompliance: null,
    socialSecurityCompliance: null,
    professionalRegistrations: [],
    licenses: [],
  },
  certifications: [{
    name: "ISO 27001 (sample only)",
    issuer: "Sample issuer",
    certificateNumber: "SAMPLE-CERT-001",
    validUntil: null,
  }],
  financial: {
    currencies: ["EUR", "CHF"],
    professionalIndemnity: "Sample value — verify before use",
    publicLiability: "Sample value — verify before use",
    minimumContractValue: "EUR 25,000",
    maximumContractValue: "EUR 250,000",
  },
  team: [{
    role: "Software delivery team",
    skills: ["Solution architecture", "Software engineering", "Delivery management"],
    languages: ["DEU", "ENG"],
    certifications: [],
  }],
  references: [{
    client: "Sample public-sector client",
    project: "Sample digital-service delivery",
    description: "Fictional reference illustrating the profile format.",
    services: ["Software development", "Cloud consulting"],
    outcome: "Sample outcome — replace with an approved reference.",
    permissionToDisclose: false,
  }],
  evidenceSummary: [{
    claim: "All values in this profile are fictional examples.",
    sourceLabel: "TenderLoop sample profile",
    confidence: "low",
  }],
};

export function companyProfileCompletion(profile: CompanyProfile) {
  const checks = [
    profile.identity.legalName, profile.identity.registrationCountry,
    profile.identity.companyDescription, profile.identity.website,
    profile.contacts.length, profile.capabilities.services.length,
    profile.capabilities.cpvCodes.length, profile.capabilities.deliveryCountries.length,
    profile.procurementReadiness.platforms.length,
    profile.procurementReadiness.tenderLanguages.length,
    profile.certifications.length, profile.references.length,
    profile.evidenceSummary.length,
  ];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}
