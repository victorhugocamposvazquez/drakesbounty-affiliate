-- Import batches (CSV uploads from drakes-ops or future operator tools)
-- + Admin read on conversions for reconciliation UIs

-- ============================================================
-- import_batches
-- ============================================================
create table if not exists public.import_batches (
  id             uuid primary key default gen_random_uuid(),
  operator_id    uuid not null references public.operators(id) on delete cascade,
  created_by     uuid not null references auth.users(id) on delete cascade,
  file_name      text,
  status         text not null default 'pending'
    check (status in ('pending', 'processing', 'done', 'error', 'partial')),
  row_count      integer,
  success_count  integer,
  error_log      text,
  created_at     timestamptz not null default now()
);

create index if not exists import_batches_operator_idx
  on public.import_batches (operator_id, created_at desc);

alter table public.import_batches enable row level security;

-- Operators see their own; admins see all
create policy "import_batches_select"
  on public.import_batches for select
  using (
    auth.uid() = operator_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "import_batches_insert"
  on public.import_batches for insert
  with check (
    auth.uid() = created_by
    and (
      auth.uid() = operator_id
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
  );

-- ============================================================
-- Admins: read all conversions (reconciliation / ops)
-- ============================================================
create policy "conversions_admin_read"
  on public.conversions for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
