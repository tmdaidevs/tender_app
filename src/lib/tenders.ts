import { z } from "zod";
import {
  canonicalTenderSchema,
  type CanonicalTender,
} from "../domain/canonical-tender";
import { normalizeOfficialTenderConstraints } from "../domain/tender-requirement";
import { getDb } from "./db";

export const tenderListInputSchema = z.object({
  q: z.string().trim().max(100).default(""),
  countries: z.array(z.enum(["DE", "AT", "CH"])).max(3).default([]),
  sources: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  buyer: z.string().trim().max(100).default(""),
  cpv: z.string().trim().max(20).default(""),
  publishedFrom: z.string().date().optional(),
  publishedTo: z.string().date().optional(),
  deadlineFrom: z.string().date().optional(),
  deadlineTo: z.string().date().optional(),
  minValue: z.number().nonnegative().optional(),
  maxValue: z.number().nonnegative().optional(),
  currency: z.enum(["EUR", "CHF"]).optional(),
  valueAvailability: z.enum(["all", "disclosed", "undisclosed"]).default("all"),
  deadlineAvailability: z.enum(["all", "dated", "undated"]).default("all"),
  sort: z
    .enum([
      "deadline_asc",
      "deadline_desc",
      "published_desc",
      "published_asc",
      "value_desc",
      "value_asc",
    ])
    .default("deadline_asc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(50),
});

export type TenderListInput = z.infer<typeof tenderListInputSchema>;

export type TenderListItem = {
  id: string;
  title: string;
  buyerName: string | null;
  sourceIdentifier: string;
  sourceUrl: string;
  sourceName: string;
  sourceBaseUrl: string;
  countryCodes: string[];
  cpvCodes: string[];
  estimatedValue: number | null;
  currency: string | null;
  publishedAt: string | null;
  deadlineAt: string | null;
  retrievedAt: string;
};

export type TenderListResult = {
  items: TenderListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type TenderSourceStatus = {
  code: string;
  name: string;
  baseUrl: string;
  lastSuccessfulSyncAt: string | null;
  lastError: string | null;
};

export async function listTenderSourceStatuses() {
  const rows = await getDb()`
    select code, name, base_url, last_successful_sync_at, last_error
    from tender_sources
    order by name asc
  `;

  return rows.map((row): TenderSourceStatus => ({
    code: String(row.code),
    name: String(row.name),
    baseUrl: String(row.base_url),
    lastSuccessfulSyncAt: row.last_successful_sync_at
      ? new Date(String(row.last_successful_sync_at)).toISOString()
      : null,
    lastError: row.last_error ? String(row.last_error) : null,
  }));
}

function escapedLike(value: string) {
  return `%${value.replace(/[\\%_]/g, "\\$&")}%`;
}

export async function listTenders(input: z.input<typeof tenderListInputSchema>) {
  const filters = tenderListInputSchema.parse(input);
  const sql = getDb();
  const qPattern = escapedLike(filters.q);
  const buyerPattern = escapedLike(filters.buyer);
  const cpvPattern = escapedLike(filters.cpv);
  const countryCsv = filters.countries.join(",");
  const sourceCsv = filters.sources.join(",");
  const publishedFrom = filters.publishedFrom ?? "1900-01-01";
  const publishedTo = filters.publishedTo ?? "2999-12-31";
  const deadlineFrom = filters.deadlineFrom ?? "1900-01-01";
  const deadlineTo = filters.deadlineTo ?? "2999-12-31";
  const minValue = filters.minValue ?? 0;
  const maxValue = filters.maxValue ?? 99999999999999;
  const offset = (filters.page - 1) * filters.limit;
  const rows = await sql`
    select
      t.id, t.title, t.buyer_name, t.source_identifier, t.source_url,
      s.name as source_name, s.base_url as source_base_url, t.country_codes, t.cpv_codes,
      t.estimated_value, t.currency, t.published_at, t.deadline_at, t.retrieved_at,
      count(*) over() as total_count
    from tenders t
    join tender_sources s on s.id = t.source_id
    where t.lane = 'public_import'
      and t.status = 'published'
      and (t.deadline_at is null or t.deadline_at >= now())
      and (
        ${filters.q} = ''
        or t.title ilike ${qPattern} escape '\'
        or coalesce(t.summary, '') ilike ${qPattern} escape '\'
        or coalesce(t.buyer_name, '') ilike ${qPattern} escape '\'
        or coalesce(t.source_identifier, '') ilike ${qPattern} escape '\'
        or exists (
          select 1 from unnest(t.cpv_codes) code
          where code ilike ${qPattern} escape '\'
        )
      )
      and (${filters.buyer} = '' or coalesce(t.buyer_name, '') ilike ${buyerPattern} escape '\')
      and (
        ${filters.cpv} = ''
        or exists (
          select 1 from unnest(t.cpv_codes) code
          where code ilike ${cpvPattern} escape '\'
        )
      )
      and (${countryCsv} = '' or t.country_codes && string_to_array(${countryCsv}, ','))
      and (${sourceCsv} = '' or s.code = any(string_to_array(${sourceCsv}, ',')))
      and (${filters.publishedFrom === undefined} or t.published_at >= ${publishedFrom}::date)
      and (${filters.publishedTo === undefined} or t.published_at < (${publishedTo}::date + interval '1 day'))
      and (${filters.deadlineFrom === undefined} or t.deadline_at >= ${deadlineFrom}::date)
      and (${filters.deadlineTo === undefined} or t.deadline_at < (${deadlineTo}::date + interval '1 day'))
      and (${filters.minValue === undefined} or t.estimated_value >= ${minValue})
      and (${filters.maxValue === undefined} or t.estimated_value <= ${maxValue})
      and (${filters.currency === undefined} or t.currency = ${filters.currency ?? "EUR"})
      and (
        ${filters.valueAvailability} = 'all'
        or (${filters.valueAvailability} = 'disclosed' and t.estimated_value is not null)
        or (${filters.valueAvailability} = 'undisclosed' and t.estimated_value is null)
      )
      and (
        ${filters.deadlineAvailability} = 'all'
        or (${filters.deadlineAvailability} = 'dated' and t.deadline_at is not null)
        or (${filters.deadlineAvailability} = 'undated' and t.deadline_at is null)
      )
    order by
      case when ${filters.sort} = 'deadline_asc' then t.deadline_at end asc nulls last,
      case when ${filters.sort} = 'deadline_desc' then t.deadline_at end desc nulls last,
      case when ${filters.sort} = 'published_desc' then t.published_at end desc nulls last,
      case when ${filters.sort} = 'published_asc' then t.published_at end asc nulls last,
      case when ${filters.sort} = 'value_desc' then t.estimated_value end desc nulls last,
      case when ${filters.sort} = 'value_asc' then t.estimated_value end asc nulls last,
      t.published_at desc nulls last
    limit ${filters.limit}
    offset ${offset}
  `;

  const items = rows.map((row): TenderListItem => ({
    id: String(row.id),
    title: String(row.title),
    buyerName: row.buyer_name ? String(row.buyer_name) : null,
    sourceIdentifier: String(row.source_identifier),
    sourceUrl: String(row.source_url),
    sourceName: String(row.source_name),
    sourceBaseUrl: String(row.source_base_url),
    countryCodes: Array.isArray(row.country_codes) ? row.country_codes.map(String) : [],
    cpvCodes: Array.isArray(row.cpv_codes) ? row.cpv_codes.map(String) : [],
    estimatedValue: row.estimated_value === null ? null : Number(row.estimated_value),
    currency: row.currency ? String(row.currency) : null,
    publishedAt: row.published_at ? new Date(String(row.published_at)).toISOString() : null,
    deadlineAt: row.deadline_at ? new Date(String(row.deadline_at)).toISOString() : null,
    retrievedAt: new Date(String(row.retrieved_at)).toISOString(),
  }));
  const total = rows[0] ? Number(rows[0].total_count) : 0;

  return {
    items,
    page: filters.page,
    pageSize: filters.limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / filters.limit),
  } satisfies TenderListResult;
}

function firstSourceString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const candidate = value.find((item) => typeof item === "string");
    return typeof candidate === "string" ? candidate : null;
  }
  if (value && typeof value === "object") {
    const localized = value as Record<string, unknown>;
    for (const language of ["eng", "deu", "en", "de"]) {
      const candidate = localized[language];
      if (typeof candidate === "string") return candidate;
      if (Array.isArray(candidate)) {
        const stringCandidate = candidate.find((item) => typeof item === "string");
        if (typeof stringCandidate === "string") return stringCandidate;
      }
    }
  }
  return null;
}

export async function getTenderById(id: string): Promise<CanonicalTender | null> {
  const tenderId = z.string().uuid().parse(id);
  const rows = await getDb()`
    select
      t.id, t.title, t.summary, t.buyer_name, t.source_identifier, t.source_url,
      t.country_codes, t.cpv_codes, t.estimated_value, t.currency, t.published_at,
      t.deadline_at, t.retrieved_at, t.updated_at, t.raw_payload, t.status, t.lane,
      s.code as source_code, s.name as source_name, s.base_url as source_base_url,
      s.official as source_official,
      v.version as latest_version, v.created_at as version_created_at,
      v.content_hash
    from tenders t
    join tender_sources s on s.id = t.source_id
    left join lateral (
      select version, created_at, content_hash
      from tender_versions
      where tender_id = t.id
      order by version desc
      limit 1
    ) v on true
    where t.id = ${tenderId}
      and t.lane = 'public_import'
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;

  const sourceRecord =
    row.raw_payload && typeof row.raw_payload === "object" && !Array.isArray(row.raw_payload)
      ? (row.raw_payload as Record<string, unknown>)
      : {};
  const amount = row.estimated_value === null ? null : Number(row.estimated_value);
  const currency = row.currency ? String(row.currency) : null;
  const countryCodes = Array.isArray(row.country_codes) ? row.country_codes.map(String) : [];
  const cpvCodes = Array.isArray(row.cpv_codes) ? row.cpv_codes.map(String) : [];
  const deadlineAt = row.deadline_at
    ? new Date(String(row.deadline_at)).toISOString()
    : null;

  return canonicalTenderSchema.parse({
    schemaVersion: "1.0",
    id: String(row.id),
    title: String(row.title),
    summary: row.summary ? String(row.summary) : null,
    noticeType: firstSourceString(sourceRecord, "notice-type"),
    status: String(row.status),
    lane: String(row.lane),
    buyer: { name: row.buyer_name ? String(row.buyer_name) : null },
    classifications: {
      cpvCodes,
    },
    placesOfPerformance: countryCodes.map((countryCode) => ({ countryCode })),
    requirements: normalizeOfficialTenderConstraints({
      sourceUrl: String(row.source_url),
      cpvCodes,
      countryCodes,
      estimatedValue: amount,
      currency,
      deadlineAt,
    }),
    value:
      amount !== null && currency !== null
        ? { amount, currency }
        : null,
    dates: {
      publishedAt: row.published_at
        ? new Date(String(row.published_at)).toISOString()
        : null,
      deadlineAt,
      retrievedAt: new Date(String(row.retrieved_at)).toISOString(),
      updatedAt: new Date(String(row.updated_at)).toISOString(),
    },
    source: {
      code: String(row.source_code),
      name: String(row.source_name),
      official: Boolean(row.source_official),
      baseUrl: String(row.source_base_url),
      noticeIdentifier: String(row.source_identifier),
      noticeUrl: String(row.source_url),
      record: sourceRecord,
    },
    provenance: {
      latestVersion: row.latest_version === null ? null : Number(row.latest_version),
      latestVersionCreatedAt: row.version_created_at
        ? new Date(String(row.version_created_at)).toISOString()
        : null,
      contentHash: row.content_hash ? String(row.content_hash) : null,
    },
  });
}
