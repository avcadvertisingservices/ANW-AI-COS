begin;

create table if not exists public.knowledge_source_events (
  id uuid primary key default gen_random_uuid(),
  knowledge_entry_id text not null
    references public.knowledge_entries(id)
    on delete cascade,
  knowledge_slug text not null,
  source_id text not null,
  event_type text not null
    check (
      event_type in (
        'source_added',
        'source_updated',
        'source_removed'
      )
    ),
  actor jsonb not null,
  before_source jsonb,
  after_source jsonb,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists
  knowledge_source_events_entry_idx
  on public.knowledge_source_events(
    knowledge_entry_id,
    created_at
  );

create index if not exists
  knowledge_source_events_source_idx
  on public.knowledge_source_events(source_id);

alter table public.knowledge_source_events
  enable row level security;

revoke all on table public.knowledge_source_events
  from anon, authenticated;

comment on table public.knowledge_source_events is
  'Immutable server-side audit trail for ANW knowledge source changes.';

commit;
