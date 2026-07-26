import { createHash } from "node:crypto";
import { z } from "zod";
import { getDb } from "@/lib/db";

const TED_SEARCH_URL = "https://api.ted.europa.eu/v3/notices/search";

const tedResponseSchema = z
  .object({
    notices: z.array(z.record(z.unknown())).optional(),
    results: z.array(z.record(z.unknown())).optional(),
    totalNoticeCount: z.number().optional(),
  })
  .passthrough();

export type TedTender = {
  sourceIdentifier: string;
  sourceUrl: string;
  title: string;
  summary: string | null;
  buyerName: string | null;
  countryCodes: string[];
  cpvCodes: string[];
  estimatedValue: number | null;
  currency: string | null;
  publishedAt: string | null;
  deadlineAt: string | null;
  rawPayload: Record<string, unknown>;
};

function scalarStrings(value: unknown): string[] {
  if (typeof value === "string" || typeof value === "number") return [String(value)];
  if (Array.isArray(value)) return value.flatMap(scalarStrings);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const preferred = ["eng", "deu", "en", "de"];
    for (const key of preferred) {
      if (key in record) {
        const values = scalarStrings(record[key]);
        if (values.length) return values;
      }
    }
    return Object.values(record).flatMap(scalarStrings);
  }
  return [];
}

function firstString(value: unknown) {
  return scalarStrings(value).find((item) => item.trim().length > 0)?.trim() ?? null;
}

function isoDate(value: unknown) {
  for (const candidate of scalarStrings(value)) {
    const normalized = /^\d{4}-\d{2}-\d{2}[+-]\d{2}:\d{2}$/.test(candidate)
      ? `${candidate.slice(0, 10)}T00:00:00${candidate.slice(10)}`
      : candidate;
    const date = new Date(normalized);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return null;
}

function numericValue(value: unknown) {
  for (const candidate of scalarStrings(value)) {
    const parsed = Number(candidate.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function countryCodes(value: unknown) {
  const mapped = new Set<string>();
  for (const item of scalarStrings(value)) {
    const upper = item.toUpperCase();
    if (upper.includes("DEU") || /^DE[A-Z0-9]/.test(upper)) mapped.add("DE");
    if (upper.includes("AUT") || /^AT[A-Z0-9]/.test(upper)) mapped.add("AT");
    if (upper.includes("CHE") || /^CH[A-Z0-9]/.test(upper)) mapped.add("CH");
  }
  return [...mapped];
}

function normalizeNotice(raw: Record<string, unknown>): TedTender | null {
  const sourceIdentifier = firstString(raw["publication-number"]);
  const title = firstString(raw["notice-title"]);
  if (!sourceIdentifier || !title) return null;

  return {
    sourceIdentifier,
    sourceUrl: `https://ted.europa.eu/en/notice/-/detail/${encodeURIComponent(sourceIdentifier)}`,
    title,
    summary: firstString(raw["description-proc"]),
    buyerName: firstString(raw["buyer-name"]),
    countryCodes: countryCodes(raw["place-of-performance"]),
    cpvCodes: scalarStrings(raw["classification-cpv"]).filter((value) => /^\d{8}$/.test(value)),
    estimatedValue:
      numericValue(raw["estimated-value-proc"]) ??
      numericValue(raw["estimated-value-lot"]),
    currency:
      firstString(raw["estimated-value-cur-proc"])?.slice(0, 3).toUpperCase() ??
      firstString(raw["estimated-value-cur-lot"])?.slice(0, 3).toUpperCase() ??
      null,
    publishedAt: isoDate(raw["publication-date"]),
    deadlineAt:
      isoDate(raw["deadline-receipt-tender-date-lot"]) ??
      isoDate(raw.deadline),
    rawPayload: raw,
  };
}

export async function fetchTedTenders(limit = 100): Promise<TedTender[]> {
  const now = new Date();
  const from = new Date(now);
  from.setUTCFullYear(from.getUTCFullYear() - 1);
  const formatTedDate = (date: Date) =>
    `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
  const query = [
    "place-of-performance IN (DEU AUT)",
    `publication-date = (${formatTedDate(from)} <> ${formatTedDate(now)})`,
    "(classification-cpv = 72* OR classification-cpv = 73* OR classification-cpv = 79* OR classification-cpv = 80*)",
  ].join(" AND ");

  const response = await fetch(TED_SEARCH_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "user-agent": "TenderLoop/0.1 public-procurement-reuser",
    },
    body: JSON.stringify({
      query,
      fields: [
        "publication-number",
        "notice-title",
        "buyer-name",
        "place-of-performance",
        "deadline",
        "deadline-receipt-tender-date-lot",
        "estimated-value-proc",
        "estimated-value-lot",
        "estimated-value-cur-proc",
        "estimated-value-cur-lot",
        "publication-date",
        "classification-cpv",
        "description-proc",
        "notice-type",
      ],
      limit: Math.min(Math.max(limit, 1), 250),
      scope: "ACTIVE",
      checkQuerySyntax: false,
      paginationMode: "PAGE_NUMBER",
      page: 1,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`TED Search API returned ${response.status}`);
  }

  const parsed = tedResponseSchema.parse(await response.json());
  const notices = parsed.notices ?? parsed.results ?? [];
  return notices.map(normalizeNotice).filter((item): item is TedTender => item !== null);
}

export async function syncTedTenders(limit = 100) {
  const sql = getDb();
  const sourceRows = await sql`select id from tender_sources where code = 'ted-eu' limit 1`;
  const sourceId = sourceRows[0]?.id;
  if (!sourceId) throw new Error("TED source is not configured; run the database migration");

  try {
    const tenders = await fetchTedTenders(limit);
    let upserted = 0;

    for (const tender of tenders) {
      const countryCodesJson = JSON.stringify(tender.countryCodes);
      const cpvCodesJson = JSON.stringify(tender.cpvCodes);
      const rows = await sql`
        insert into tenders (
          source_id, lane, status, source_identifier, source_url, title, summary,
          buyer_name, country_codes, cpv_codes, estimated_value, currency,
          published_at, deadline_at, retrieved_at, raw_payload
        )
        values (
          ${sourceId}, 'public_import', 'published', ${tender.sourceIdentifier},
          ${tender.sourceUrl}, ${tender.title}, ${tender.summary}, ${tender.buyerName},
          array(select jsonb_array_elements_text(${countryCodesJson}::jsonb)),
          array(select jsonb_array_elements_text(${cpvCodesJson}::jsonb)),
          ${tender.estimatedValue},
          ${tender.currency}, ${tender.publishedAt}, ${tender.deadlineAt}, now(),
          ${JSON.stringify(tender.rawPayload)}::jsonb
        )
        on conflict (source_id, source_identifier) do update set
          source_url = excluded.source_url,
          title = excluded.title,
          summary = excluded.summary,
          buyer_name = excluded.buyer_name,
          country_codes = excluded.country_codes,
          cpv_codes = excluded.cpv_codes,
          estimated_value = excluded.estimated_value,
          currency = excluded.currency,
          published_at = excluded.published_at,
          deadline_at = excluded.deadline_at,
          retrieved_at = now(),
          raw_payload = excluded.raw_payload,
          updated_at = now()
        returning id
      `;
      const snapshot = JSON.stringify(tender.rawPayload);
      const contentHash = createHash("sha256").update(snapshot).digest("hex");
      const versionRows = await sql`
        select content_hash from tender_versions
        where tender_id = ${rows[0].id}
        order by version desc
        limit 1
      `;
      if (versionRows[0]?.content_hash !== contentHash) {
        await sql`
          insert into tender_versions (tender_id, version, snapshot, content_hash)
          values (
            ${rows[0].id},
            coalesce((select max(version) + 1 from tender_versions where tender_id = ${rows[0].id}), 1),
            ${snapshot}::jsonb,
            ${contentHash}
          )
        `;
      }
      upserted += 1;
    }

    await sql`
      update tender_sources
      set last_successful_sync_at = now(), last_error = null
      where id = ${sourceId}
    `;
    return { fetched: tenders.length, upserted };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Unknown TED sync error";
    await sql`update tender_sources set last_error = ${message} where id = ${sourceId}`;
    throw error;
  }
}
