begin;

drop index if exists public.knowledge_review_requests_one_active_per_entry_idx;

create unique index knowledge_review_requests_one_active_per_entry_idx
on public.knowledge_review_requests (knowledge_entry_id)
where status in (
  'draft',
  'submitted',
  'in_review',
  'changes_requested'
);

commit;
