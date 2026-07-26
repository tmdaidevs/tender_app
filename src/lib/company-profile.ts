import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { load } from "cheerio";
import { isPrivateAddress } from "@/domain/public-network";
import {
  companyProfileCompletion,
  companyProfileSchema,
  emptyCompanyProfile,
  type CompanyProfile,
} from "@/domain/company-profile";
import { getDb } from "@/lib/db";

let companyProfileSchemaReady: Promise<void> | null = null;

export function ensureCompanyProfileSchema() {
  if (!companyProfileSchemaReady) {
    const sql = getDb();
    companyProfileSchemaReady = (async () => {
      await sql.query(`
        create table if not exists company_profiles (
          id uuid primary key default gen_random_uuid(),
          organization_id uuid not null unique references organizations(id) on delete cascade,
          status text not null default 'draft' check (status in ('draft', 'active')),
          profile jsonb not null default '{}'::jsonb,
          completion_percent integer not null default 0 check (completion_percent between 0 and 100),
          generated_by_ai boolean not null default false,
          approved_by uuid references users(id),
          approved_at timestamptz,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `);
      await sql.query(`
        create table if not exists company_profile_sources (
          id uuid primary key default gen_random_uuid(),
          organization_id uuid not null references organizations(id) on delete cascade,
          source_type text not null check (source_type in ('website', 'pdf')),
          source_url text, file_name text, media_type text,
          content_hash text not null, source_snapshot text not null,
          created_by uuid not null references users(id),
          created_at timestamptz not null default now()
        )
      `);
      await sql.query(`
        create table if not exists company_profile_generations (
          id uuid primary key default gen_random_uuid(),
          organization_id uuid not null references organizations(id) on delete cascade,
          profile_id uuid references company_profiles(id) on delete cascade,
          source_ids uuid[] not null default '{}',
          status text not null check (status in ('processing', 'complete', 'error')),
          model text not null, prompt_version text not null, result jsonb,
          input_tokens integer, output_tokens integer, total_tokens integer,
          last_error text, created_by uuid not null references users(id),
          created_at timestamptz not null default now(), completed_at timestamptz,
          updated_at timestamptz not null default now()
        )
      `);
      await sql.query(`create index if not exists company_profile_sources_org_created_idx on company_profile_sources(organization_id, created_at desc)`);
      await sql.query(`create index if not exists company_profile_generations_org_created_idx on company_profile_generations(organization_id, created_at desc)`);
    })().catch((error) => {
      companyProfileSchemaReady = null;
      throw error;
    });
  }
  return companyProfileSchemaReady;
}

export async function getCompanyProfile(organizationId: string) {
  await ensureCompanyProfileSchema();
  const rows = await getDb()`
    select id, status, profile, completion_percent, generated_by_ai, approved_at, updated_at
    from company_profiles where organization_id = ${organizationId} limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  const parsedProfile = companyProfileSchema.safeParse(row.profile);

  return {
    id: String(row.id),
    status: String(row.status),
    profile: parsedProfile.success ? parsedProfile.data : emptyCompanyProfile,
    completionPercent: Number(row.completion_percent),
    generatedByAi: Boolean(row.generated_by_ai),
    approvedAt: row.approved_at ? new Date(String(row.approved_at)).toISOString() : null,
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function saveCompanyProfile({
  organizationId,
  userId,
  profile,
  generatedByAi = false,
}: {
  organizationId: string;
  userId: string;
  profile: CompanyProfile;
  generatedByAi?: boolean;
}) {
  await ensureCompanyProfileSchema();
  const parsed = companyProfileSchema.parse(profile);
  const completion = companyProfileCompletion(parsed);
  const rows = await getDb()`
    insert into company_profiles (
      organization_id, status, profile, completion_percent, generated_by_ai, updated_at
    ) values (
      ${organizationId}, 'draft', ${JSON.stringify(parsed)}::jsonb,
      ${completion}, ${generatedByAi}, now()
    )
    on conflict (organization_id) do update set
      status = 'draft',
      profile = excluded.profile,
      completion_percent = excluded.completion_percent,
      generated_by_ai = excluded.generated_by_ai,
      approved_by = null,
      approved_at = null,
      updated_at = now()
    returning id
  `;
  await getDb()`
    insert into audit_events (organization_id, actor_user_id, action, entity_type, entity_id)
    values (${organizationId}, ${userId}, 'company_profile.saved', 'company_profile', ${String(rows[0].id)})
  `;
  return { id: String(rows[0].id), completionPercent: completion };
}

export async function fetchPublicWebsite(input: string) {
  const url = new URL(input);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("Only HTTP(S) websites are supported");
  if (url.username || url.password) throw new Error("Website credentials are not supported");
  const addresses = await lookup(url.hostname, { all: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("Website must resolve to a public internet address");
  }
  const response = await fetch(url, {
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    headers: { accept: "text/html,application/xhtml+xml", "user-agent": "TenderLoop/0.3 company-profile-builder" },
  });
  if (!response.ok) throw new Error(`Website returned ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
    throw new Error("Website must return HTML");
  }
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > 1_500_000) throw new Error("Website exceeds the 1.5 MB ingestion limit");
  const html = await response.text();
  if (Buffer.byteLength(html) > 1_500_000) throw new Error("Website exceeds the 1.5 MB ingestion limit");
  const $ = load(html);
  $("script,style,noscript,svg,nav,footer").remove();
  const title = $("title").first().text().trim();
  const textContent = $("body").text().replace(/\s+/g, " ").trim().slice(0, 80_000);
  if (!textContent) throw new Error("Website did not contain readable company information");
  return { url: url.toString(), title, text: textContent };
}

export function sourceHash(content: string | Buffer) {
  return createHash("sha256").update(content).digest("hex");
}

export { emptyCompanyProfile };
