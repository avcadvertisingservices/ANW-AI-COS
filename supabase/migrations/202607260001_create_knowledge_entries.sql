begin;

create table if not exists public.knowledge_entries (
  id text primary key,
  slug text not null unique,
  title text not null,
  summary text not null,
  body text not null,
  category text not null check (
    category in (
      'medical-fact',
      'symptom',
      'diagnosis',
      'treatment',
      'recovery',
      'faq',
      'survivor-story',
      'research',
      'glossary',
      'resource'
    )
  ),
  status text not null default 'draft' check (
    status in ('draft', 'review', 'approved', 'archived')
  ),
  tags text[] not null default '{}',
  keywords text[] not null default '{}',
  aliases text[] not null default '{}',
  sources jsonb not null default '[]'::jsonb,
  medical_review_required boolean not null default true,
  reviewed_by text,
  reviewed_at timestamptz,
  version text not null default '1.0.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint knowledge_entries_review_guard check (
    status <> 'approved'
    or medical_review_required = false
    or (
      reviewed_by is not null
      and reviewed_at is not null
    )
  )
);

create index if not exists knowledge_entries_category_idx
  on public.knowledge_entries (category);

create index if not exists knowledge_entries_status_idx
  on public.knowledge_entries (status);

create index if not exists knowledge_entries_updated_at_idx
  on public.knowledge_entries (updated_at desc);

create index if not exists knowledge_entries_tags_gin_idx
  on public.knowledge_entries using gin (tags);

create index if not exists knowledge_entries_keywords_gin_idx
  on public.knowledge_entries using gin (keywords);

alter table public.knowledge_entries enable row level security;

revoke all on table public.knowledge_entries from anon;
revoke all on table public.knowledge_entries from authenticated;

comment on table public.knowledge_entries is
  'Controlled knowledge records for ANW AI-COS. Server-side administration only in v1.1.';

comment on column public.knowledge_entries.sources is
  'JSON array of source metadata and evidence levels.';

commit;
