begin;

create table if not exists public.carousel_projects (
  id uuid primary key default gen_random_uuid(),
  content_bundle_id uuid references public.content_bundles(id) on delete set null,
  topic text not null,
  title text not null,
  aspect_ratio text not null default '9:16'
    check (aspect_ratio in ('9:16', '4:5', '1:1')),
  platforms text[] not null default array['facebook', 'instagram']::text[],
  version integer not null default 1 check (version > 0),
  status text not null default 'medical_review'
    check (status in ('draft', 'design_review', 'medical_review', 'approved', 'rendered', 'archived')),
  brand_snapshot jsonb not null,
  quality_report jsonb not null default '{}'::jsonb,
  caption text not null default '',
  hashtags text[] not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.carousel_slide_specs (
  id uuid primary key default gen_random_uuid(),
  carousel_project_id uuid not null references public.carousel_projects(id) on delete cascade,
  slide_number integer not null check (slide_number between 1 and 20),
  role text not null,
  layout text not null,
  title text not null,
  headline text not null default '',
  body text not null default '',
  call_to_action text not null default '',
  image_prompt text not null,
  voiceover text not null default '',
  alt_text text not null,
  design_spec jsonb not null,
  filename text not null,
  medical_review_flag boolean not null default true,
  copy_review_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (carousel_project_id, slide_number)
);

create index if not exists carousel_projects_status_idx
  on public.carousel_projects(status);

create index if not exists carousel_projects_created_at_idx
  on public.carousel_projects(created_at desc);

create index if not exists carousel_slide_specs_project_idx
  on public.carousel_slide_specs(carousel_project_id, slide_number);

alter table public.carousel_projects enable row level security;
alter table public.carousel_slide_specs enable row level security;

revoke all on table public.carousel_projects from anon, authenticated;
revoke all on table public.carousel_slide_specs from anon, authenticated;

comment on table public.carousel_projects is
  'Server-managed ANW carousel production packages derived from reviewed content bundles.';

comment on table public.carousel_slide_specs is
  'Design-ready specifications for each carousel slide.';

commit;
