alter table company_profiles
  drop constraint if exists company_profiles_organization_id_key;

alter table company_profiles
  add column if not exists name text not null default 'Company Profile',
  add column if not exists is_sample boolean not null default false;

create unique index if not exists company_profiles_org_name_unique_idx
  on company_profiles (organization_id, lower(name));

create index if not exists company_profiles_org_updated_idx
  on company_profiles (organization_id, updated_at desc);
