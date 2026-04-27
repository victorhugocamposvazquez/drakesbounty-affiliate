-- One row per successful Arsenal AI generation (for per-user rate limiting).
-- RLS: no client policies — only service role (server actions) reads/writes.

create table if not exists public.arsenal_ai_rate_log (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists arsenal_ai_rate_log_user_created_idx
  on public.arsenal_ai_rate_log (user_id, created_at desc);

comment on table public.arsenal_ai_rate_log is
  'Arsenal copy assistant: successful generations, used to enforce per-user rate limits.';

alter table public.arsenal_ai_rate_log enable row level security;
