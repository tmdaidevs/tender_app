import { z } from "zod";
import { getDb } from "./db";

const listInputSchema = z.object({
  q: z.string().trim().max(100).default(""),
  country: z.enum(["DE", "AT", "CH"]).optional(),
  limit: z.number().int().min(1).max(100).default(30),
});

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

export async function listTenders(input: z.input<typeof listInputSchema>) {
  const { q, country, limit } = listInputSchema.parse(input);
  const sql = getDb();
  const rows = await sql`
    select
      t.id, t.title, t.buyer_name, t.source_identifier, t.source_url,
      s.name as source_name, s.base_url as source_base_url, t.country_codes, t.cpv_codes,
      t.estimated_value, t.currency, t.published_at, t.deadline_at, t.retrieved_at
    from tenders t
    join tender_sources s on s.id = t.source_id
    where t.lane = 'public_import'
      and t.status = 'published'
      and (t.deadline_at is null or t.deadline_at >= now())
      and (${q} = '' or to_tsvector('simple',
        coalesce(t.title, '') || ' ' || coalesce(t.summary, '') || ' ' || coalesce(t.buyer_name, '')
      ) @@ plainto_tsquery('simple', ${q}))
      and (${country ?? ""} = '' or ${country ?? ""} = any(t.country_codes))
    order by t.deadline_at asc nulls last, t.published_at desc nulls last
    limit ${limit}
  `;

  return rows.map((row): TenderListItem => ({
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
}
