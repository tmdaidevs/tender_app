create table if not exists tender_ai_generations (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references tenders(id) on delete cascade,
  source_tender_version integer,
  source_document_url text not null,
  source_content_hash text not null,
  source_snapshot text not null,
  status text not null check (status in ('pending', 'processing', 'complete', 'error')),
  model text not null,
  prompt_version text not null,
  result jsonb,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  last_error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (tender_id, source_content_hash, prompt_version, model)
);

create index if not exists tender_ai_generations_tender_status_idx
  on tender_ai_generations(tender_id, status, completed_at desc);

create index if not exists tender_ai_generations_status_created_idx
  on tender_ai_generations(status, created_at);
