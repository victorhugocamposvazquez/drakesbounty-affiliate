-- ============================================================
-- 0002 — Billboard copy + partner tracking URL + public read RLS
-- ============================================================

-- Destination URL when a fan clicks a tracked link on a bounty card.
alter table public.bounties
  add column if not exists tracking_url text;

comment on column public.bounties.tracking_url is
  'Where to send the visitor after a tracked click (operator landing or deep link).';

-- Hero text on a creator’s public Billboard (retrowave page).
alter table public.creators
  add column if not exists billboard_headline text not null default '';

alter table public.creators
  add column if not exists billboard_subline text not null default '';

-- ============================================================
-- Public read policies (for anonymous / anon-key clients)
-- Only rows that are part of a published billboard are visible.
-- ============================================================

create policy "profiles_public_billboard_read"
  on public.profiles for select
  using (
    handle is not null
    and exists (
      select 1 from public.creators c
      where c.id = profiles.id
        and c.billboard_published = true
    )
  );

create policy "creators_public_billboard_read"
  on public.creators for select
  using (billboard_published = true);

create policy "billboard_campaigns_public_read"
  on public.billboard_campaigns for select
  using (
    visible
    and exists (
      select 1 from public.creators c
      where c.id = billboard_campaigns.creator_id
        and c.billboard_published = true
    )
  );

-- ============================================================
-- End
-- ============================================================
