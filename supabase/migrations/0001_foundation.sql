create extension if not exists pgcrypto;

create type public.organization_kind as enum ('supplier', 'buyer', 'both');
create type public.tender_lane as enum ('public_import', 'private_open', 'invite_only');
create type public.tender_status as enum ('draft', 'published', 'closed', 'evaluating', 'awarded', 'cancelled');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind public.organization_kind not null,
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('organization_owner','organization_admin','supplier_member','buyer_member','buyer_evaluator','read_only_auditor')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.tenders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  lane public.tender_lane not null,
  status public.tender_status not null default 'draft',
  title text not null,
  summary text not null,
  source_name text,
  source_identifier text,
  source_url text,
  deadline timestamptz not null,
  published_version integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_name, source_identifier)
);

create table public.tender_versions (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  content_hash text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (tender_id, version)
);

create table public.bids (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders(id),
  supplier_organization_id uuid not null references public.organizations(id),
  status text not null check (status in ('draft','submitted','withdrawn')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tender_id, supplier_organization_id)
);

create table public.bid_versions (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null references public.bids(id) on delete cascade,
  version integer not null,
  confidential_content jsonb not null,
  content_hash text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (bid_id, version)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.tenders enable row level security;
alter table public.tender_versions enable row level security;
alter table public.bids enable row level security;
alter table public.bid_versions enable row level security;
alter table public.audit_events enable row level security;

create function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.organization_members m
  where m.organization_id = target_org and m.user_id = auth.uid()
) $$;

create policy "members read own organizations" on public.organizations
for select using (public.is_org_member(id));

create policy "members read own membership" on public.organization_members
for select using (public.is_org_member(organization_id));

create policy "public tenders or owning organization" on public.tenders
for select using (
  (lane in ('public_import','private_open') and status <> 'draft')
  or public.is_org_member(organization_id)
);

create policy "supplier reads own bids" on public.bids
for select using (public.is_org_member(supplier_organization_id));

-- Bid content intentionally has no buyer-facing policy. A privileged server
-- function must re-check the tender deadline and evaluator role after closure.
create policy "supplier reads own bid versions" on public.bid_versions
for select using (
  exists (
    select 1 from public.bids b
    where b.id = bid_id and public.is_org_member(b.supplier_organization_id)
  )
);
