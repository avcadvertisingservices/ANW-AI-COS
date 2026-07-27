begin;

create table if not exists public.knowledge_review_requests (
  id uuid primary key default gen_random_uuid(),
  knowledge_entry_id text not null,
  knowledge_slug text not null,
  knowledge_title text not null,
  status text not null default 'draft'
    check (
      status in (
        'draft',
        'submitted',
        'in_review',
        'changes_requested',
        'approved',
        'rejected',
        'cancelled'
      )
    ),
  requested_by jsonb not null,
  assigned_reviewer jsonb,
  submission_notes text not null default '',
  review_notes text,
  decision_reason text,
  knowledge_snapshot jsonb not null,
  policy_report jsonb not null,
  submitted_at timestamptz,
  review_started_at timestamptz,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_review_events (
  id uuid primary key default gen_random_uuid(),
  review_request_id uuid not null
    references public.knowledge_review_requests(id)
    on delete cascade,
  knowledge_entry_id text not null,
  event_type text not null
    check (
      event_type in (
        'draft_created',
        'submitted',
        'review_started',
        'changes_requested',
        'resubmitted',
        'approved',
        'rejected',
        'cancelled'
      )
    ),
  actor jsonb not null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists
  knowledge_review_requests_one_active_per_entry_idx
  on public.knowledge_review_requests(knowledge_entry_id)
  where status in (
    'draft',
    'submitted',
    'in_review',
    'changes_requested'
  );

create index if not exists
  knowledge_review_requests_status_idx
  on public.knowledge_review_requests(status);

create index if not exists
  knowledge_review_requests_created_at_idx
  on public.knowledge_review_requests(created_at desc);

create index if not exists
  knowledge_review_events_request_idx
  on public.knowledge_review_events(review_request_id, created_at);

alter table public.knowledge_review_requests
  enable row level security;

alter table public.knowledge_review_events
  enable row level security;

revoke all on table
  public.knowledge_review_requests
  from anon, authenticated;

revoke all on table
  public.knowledge_review_events
  from anon, authenticated;

comment on table public.knowledge_review_requests is
  'Server-managed ANW knowledge review and approval requests.';

comment on table public.knowledge_review_events is
  'Immutable audit trail for ANW knowledge review decisions.';

commit;
