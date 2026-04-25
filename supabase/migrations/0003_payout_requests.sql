-- ============================================================
-- 0003 — Pagadero v2 base: payout requests
-- ============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payout_rail') then
    create type payout_rail as enum ('usdc', 'sepa');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payout_status') then
    create type payout_status as enum (
      'requested',
      'reviewing',
      'scheduled',
      'paid',
      'rejected',
      'cancelled'
    );
  end if;
end$$;

create table if not exists public.payout_requests (
  id                    uuid primary key default gen_random_uuid(),
  creator_id            uuid not null references public.creators(id) on delete cascade,
  amount_cents          integer not null check (amount_cents > 0),
  currency              text not null default 'EUR',
  rail                  payout_rail not null,
  destination           text not null,
  destination_hint      text,
  status                payout_status not null default 'requested',
  notes                 text,
  requested_at          timestamptz not null default now(),
  reviewed_at           timestamptz,
  paid_at               timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists payout_requests_creator_idx
  on public.payout_requests (creator_id, requested_at desc);

create index if not exists payout_requests_status_idx
  on public.payout_requests (status, requested_at desc);

drop trigger if exists payout_requests_set_updated_at on public.payout_requests;
create trigger payout_requests_set_updated_at
before update on public.payout_requests
for each row execute function set_updated_at();

alter table public.payout_requests enable row level security;

drop policy if exists "payout_requests_creator_read" on public.payout_requests;
create policy "payout_requests_creator_read"
  on public.payout_requests for select
  using (auth.uid() = creator_id);

drop policy if exists "payout_requests_creator_insert" on public.payout_requests;
create policy "payout_requests_creator_insert"
  on public.payout_requests for insert
  with check (
    auth.uid() = creator_id
    and status = 'requested'
  );

-- No creator-side updates/deletes: settlement trail is append-first.

comment on table public.payout_requests is
  'Creator payout requests (Pagadero v2): status, rail and destination.';

