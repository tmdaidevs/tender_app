create extension if not exists pgcrypto;

do $$ begin
  create type organization_kind as enum ('supplier', 'buyer', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type organization_role as enum (
    'platform_admin', 'organization_owner', 'organization_admin',
    'supplier_member', 'buyer_member', 'buyer_evaluator', 'read_only_auditor'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type tender_lane as enum ('public_import', 'private_open', 'invite_only');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tender_status as enum (
    'draft', 'published', 'closed', 'evaluating', 'awarded', 'cancelled', 'expired'
  );
exception when duplicate_object then null; end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text not null,
  password_hash text not null,
  platform_role organization_role,
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_id_idx on sessions(user_id);
create index if not exists sessions_expires_at_idx on sessions(expires_at);

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  kind organization_kind not null,
  registration_country char(2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_members (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role organization_role not null,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index if not exists organization_members_user_id_idx on organization_members(user_id);

create table if not exists tender_sources (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  base_url text not null,
  official boolean not null default false,
  last_successful_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table if not exists tenders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  source_id uuid references tender_sources(id),
  lane tender_lane not null,
  status tender_status not null default 'published',
  source_identifier text,
  source_url text,
  title text not null,
  summary text,
  buyer_name text,
  country_codes text[] not null default '{}',
  cpv_codes text[] not null default '{}',
  estimated_value numeric(16,2),
  currency char(3),
  published_at timestamptz,
  deadline_at timestamptz,
  retrieved_at timestamptz not null default now(),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenders_owner_check check (
    (lane = 'public_import' and organization_id is null and source_id is not null)
    or (lane <> 'public_import' and organization_id is not null)
  ),
  unique (source_id, source_identifier)
);
create index if not exists tenders_status_deadline_idx on tenders(status, deadline_at);
create index if not exists tenders_source_identifier_idx on tenders(source_id, source_identifier);
create index if not exists tenders_organization_id_idx on tenders(organization_id);
create index if not exists tenders_country_codes_idx on tenders using gin(country_codes);
create index if not exists tenders_cpv_codes_idx on tenders using gin(cpv_codes);
create index if not exists tenders_search_idx on tenders using gin(
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(buyer_name, ''))
);

create table if not exists tender_versions (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references tenders(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  content_hash text not null,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  unique (tender_id, version)
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  actor_user_id uuid references users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create index if not exists audit_events_org_time_idx on audit_events(organization_id, occurred_at desc);

insert into tender_sources (code, name, base_url, official)
values ('ted-eu', 'Tenders Electronic Daily (TED)', 'https://ted.europa.eu', true)
on conflict (code) do update set
  name = excluded.name,
  base_url = excluded.base_url,
  official = excluded.official;
