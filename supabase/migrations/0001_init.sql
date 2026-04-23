-- ============================================================
-- Drake's Bounty — Initial schema (MVP)
-- ============================================================
-- Covers: profiles, creators, operators, bounties, billboard,
-- tracking (clicks + conversions) and the Code signatures.
--
-- Apply from Supabase dashboard → SQL Editor, or via:
--   supabase db push (if using the CLI)
-- ============================================================

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ============================================================
-- Enums
-- ============================================================
create type profile_role as enum ('creator', 'operator', 'admin');
create type creator_tier as enum ('deputy', 'marshal', 'outlaw', 'kingpin');
create type vertical_kind as enum ('casino', 'sports', 'trading', 'crypto', 'poker', 'other');
create type channel_kind  as enum ('twitch', 'kick', 'telegram', 'x', 'youtube', 'instagram', 'discord', 'other');
create type payout_model  as enum ('cpa', 'revshare', 'hybrid');
create type bounty_status as enum ('draft', 'active', 'paused', 'ended');
create type conversion_kind as enum ('registration', 'deposit', 'ftd', 'custom');

-- ============================================================
-- Utilities
-- ============================================================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- profiles — one row per authenticated user, mirrors auth.users
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          profile_role not null default 'creator',
  handle        citext unique,           -- e.g. "elena-kicks" → used in billboard URL
  display_name  text,
  country       text,
  locale        text not null default 'en' check (locale in ('en','es')),
  avatar_url    text,
  onboarded_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function set_updated_at();

-- Auto-create profile row when a new auth user signs up.
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, locale)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::profile_role, 'creator'),
    coalesce(new.raw_user_meta_data ->> 'locale', 'en')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_auth_user();

-- ============================================================
-- creators — one row per creator profile
-- ============================================================
create table public.creators (
  id                  uuid primary key references public.profiles(id) on delete cascade,
  tier                creator_tier not null default 'deputy',
  main_channel        channel_kind,
  vertical            vertical_kind,
  audience_size       integer check (audience_size >= 0),
  website_url         text,
  billboard_theme     text not null default 'drake',
  billboard_published boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger creators_set_updated_at
before update on public.creators
for each row execute function set_updated_at();

-- ============================================================
-- operators — one row per operator profile
-- ============================================================
create table public.operators (
  id             uuid primary key references public.profiles(id) on delete cascade,
  legal_name     text not null,
  vertical       vertical_kind,
  markets        text[] not null default '{}',  -- ISO country codes
  website_url    text,
  license_info   jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger operators_set_updated_at
before update on public.operators
for each row execute function set_updated_at();

-- ============================================================
-- code_signatures — every Code oath signed, immutable record
-- ============================================================
create table public.code_signatures (
  id                 uuid primary key default gen_random_uuid(),
  profile_id         uuid not null references public.profiles(id) on delete cascade,
  role               profile_role not null,
  code_version       text not null default '1.0',
  articles_accepted  text[] not null default '{}',
  ip_address         inet,
  user_agent         text,
  signed_at          timestamptz not null default now()
);

create index code_signatures_profile_idx on public.code_signatures(profile_id);

-- ============================================================
-- bounties — campaigns funded by operators
-- ============================================================
create table public.bounties (
  id                uuid primary key default gen_random_uuid(),
  operator_id       uuid not null references public.operators(id) on delete cascade,
  title             text not null,
  description       text,
  vertical          vertical_kind,
  payout_model      payout_model not null,
  cpa_amount_cents  integer check (cpa_amount_cents is null or cpa_amount_cents >= 0),
  revshare_pct      numeric(5,2) check (revshare_pct is null or (revshare_pct >= 0 and revshare_pct <= 100)),
  currency          text not null default 'EUR',
  status            bounty_status not null default 'draft',
  starts_at         timestamptz,
  ends_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index bounties_operator_idx on public.bounties(operator_id);
create index bounties_status_idx on public.bounties(status);

create trigger bounties_set_updated_at
before update on public.bounties
for each row execute function set_updated_at();

-- ============================================================
-- billboard_campaigns — bounties displayed on a creator's billboard
-- ============================================================
create table public.billboard_campaigns (
  id              uuid primary key default gen_random_uuid(),
  creator_id      uuid not null references public.creators(id) on delete cascade,
  bounty_id       uuid not null references public.bounties(id) on delete cascade,
  position        integer not null default 0,
  featured        boolean not null default false,
  custom_title    text,
  custom_message  text,
  visible         boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (creator_id, bounty_id)
);

create index billboard_campaigns_creator_idx on public.billboard_campaigns(creator_id);

create trigger billboard_campaigns_set_updated_at
before update on public.billboard_campaigns
for each row execute function set_updated_at();

-- ============================================================
-- clicks — every click routed through Drake's Bounty links
-- ============================================================
create table public.clicks (
  id                    uuid primary key default gen_random_uuid(),
  creator_id            uuid not null references public.creators(id) on delete cascade,
  bounty_id             uuid references public.bounties(id) on delete set null,
  billboard_campaign_id uuid references public.billboard_campaigns(id) on delete set null,
  visitor_hash          text not null,   -- sha256(ip + ua + day), avoids storing raw PII
  country_code          text,
  device                text,            -- desktop / mobile / tablet
  source                text,            -- referrer host
  landing_url           text,
  tracked_at            timestamptz not null default now()
);

create index clicks_creator_day_idx on public.clicks(creator_id, tracked_at desc);
create index clicks_bounty_idx on public.clicks(bounty_id);

-- ============================================================
-- conversions — postback events from operators (registrations, deposits, FTD)
-- ============================================================
create table public.conversions (
  id                uuid primary key default gen_random_uuid(),
  click_id          uuid references public.clicks(id) on delete set null,
  creator_id        uuid not null references public.creators(id) on delete cascade,
  bounty_id         uuid not null references public.bounties(id) on delete cascade,
  operator_id       uuid not null references public.operators(id) on delete cascade,
  event_type        conversion_kind not null,
  amount_cents      integer,                         -- deposit / FTD amount, if any
  commission_cents  integer,                         -- what the creator earns on this event
  currency          text not null default 'EUR',
  external_id       text,                            -- operator's own event id for idempotency
  occurred_at       timestamptz not null,
  received_at       timestamptz not null default now(),
  unique (operator_id, external_id)
);

create index conversions_creator_idx on public.conversions(creator_id, occurred_at desc);
create index conversions_bounty_idx on public.conversions(bounty_id);

-- ============================================================
-- Row-level security (RLS)
-- ============================================================
alter table public.profiles              enable row level security;
alter table public.creators              enable row level security;
alter table public.operators             enable row level security;
alter table public.code_signatures       enable row level security;
alter table public.bounties              enable row level security;
alter table public.billboard_campaigns   enable row level security;
alter table public.clicks                enable row level security;
alter table public.conversions           enable row level security;

-- profiles
create policy "profiles_self_read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id);

-- creators
create policy "creators_self_read"
  on public.creators for select
  using (auth.uid() = id);

create policy "creators_self_upsert"
  on public.creators for insert
  with check (auth.uid() = id);

create policy "creators_self_update"
  on public.creators for update
  using (auth.uid() = id);

-- operators
create policy "operators_self_read"
  on public.operators for select
  using (auth.uid() = id);

create policy "operators_self_upsert"
  on public.operators for insert
  with check (auth.uid() = id);

create policy "operators_self_update"
  on public.operators for update
  using (auth.uid() = id);

-- code_signatures — append-only from the signer, readable by the signer
create policy "code_signatures_self_read"
  on public.code_signatures for select
  using (auth.uid() = profile_id);

create policy "code_signatures_self_insert"
  on public.code_signatures for insert
  with check (auth.uid() = profile_id);

-- bounties: operator manages its own; active ones are public-readable
create policy "bounties_operator_full"
  on public.bounties for all
  using (auth.uid() = operator_id)
  with check (auth.uid() = operator_id);

create policy "bounties_public_active_read"
  on public.bounties for select
  using (status = 'active');

-- billboard_campaigns: only the owning creator
create policy "billboard_campaigns_creator_full"
  on public.billboard_campaigns for all
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

-- clicks: creators read their own; inserts will be done via service-role endpoint
create policy "clicks_creator_read"
  on public.clicks for select
  using (auth.uid() = creator_id);

-- conversions: creators and operators read their side
create policy "conversions_creator_read"
  on public.conversions for select
  using (auth.uid() = creator_id);

create policy "conversions_operator_read"
  on public.conversions for select
  using (auth.uid() = operator_id);

-- ============================================================
-- End of initial migration
-- ============================================================
