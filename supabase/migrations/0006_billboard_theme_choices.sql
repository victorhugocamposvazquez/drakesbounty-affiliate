-- Align billboard_theme to three public layouts: retrowave, minimal, broadsheet.
-- Legacy 'drake' (init default) maps to 'retrowave'.

update public.creators
set billboard_theme = 'retrowave'
where coalesce(billboard_theme, '') in ('', 'drake', 'default')
   or billboard_theme not in ('retrowave', 'minimal', 'broadsheet');

alter table public.creators
  alter column billboard_theme set default 'retrowave';

alter table public.creators
  drop constraint if exists creators_billboard_theme_check;

alter table public.creators
  add constraint creators_billboard_theme_check
  check (billboard_theme in ('retrowave', 'minimal', 'broadsheet'));

comment on column public.creators.billboard_theme is
  'Public Billboard layout: retrowave (neon), minimal (slate), broadsheet (print).';
