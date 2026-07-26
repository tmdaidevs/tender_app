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
);

create table if not exists company_profile_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  source_type text not null check (source_type in ('website', 'pdf')),
  source_url text,
  file_name text,
  media_type text,
  content_hash text not null,
  source_snapshot text not null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);
create index if not exists company_profile_sources_org_created_idx
  on company_profile_sources(organization_id, created_at desc);

create table if not exists company_profile_generations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  profile_id uuid references company_profiles(id) on delete cascade,
  source_ids uuid[] not null default '{}',
  status text not null check (status in ('processing', 'complete', 'error')),
  model text not null,
  prompt_version text not null,
  result jsonb,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  last_error text,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists company_profile_generations_org_created_idx
  on company_profile_generations(organization_id, created_at desc);
