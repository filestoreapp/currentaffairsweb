-- 2026-11-13: Lifetime page-view storage (page_view_daily + rollup)
-- Run this in the Supabase SQL editor (one copy-paste). Safe to re-run.
--
-- Problem: page_views logs every visit, but prune_page_views() deletes rows
-- older than 90 days, so lifetime visit data was thrown away.
--
-- Fix: one row per (day, path) in page_view_daily, never pruned.
-- rollup_page_views() aggregates raw rows older than the retention window
-- into page_view_daily, then deletes exactly those raw rows — in one
-- transaction, so a prune can never run without the rollup. The hourly
-- psc-scrape worker now calls rollup_page_views() instead of
-- prune_page_views(). prune_page_views() is kept defined for safety.
--
-- This script also backfills ALL current raw rows into page_view_daily
-- and deletes them, so the lifetime total starts from the full retained
-- history. Recent-window stats read daily + raw merged, so nothing breaks.
-- Days are UTC calendar days, matching how the site slices created_at.

-- 1. Daily aggregate table (never pruned).
create table if not exists page_view_daily (
  day date not null,
  path text not null,
  views int not null default 0,
  primary key (day, path)
);

alter table page_view_daily enable row level security;
-- No policies: reads go through the service-role client only, exactly like
-- page_views (anon has no SELECT). Service role bypasses RLS.

create index if not exists page_view_daily_day_idx on page_view_daily (day desc);

-- 2. Rollup + prune in one transaction. Returns the number of raw rows
-- deleted (same contract as prune_page_views, so the worker call site
-- only swaps the function name). Each deleted raw row contributes exactly
-- 1 to page_view_daily, so lifetime totals never lose a visit.
create or replace function rollup_page_views(retention_days int default 90)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted int;
begin
  retention_days := greatest(30, least(365, retention_days));
  insert into page_view_daily (day, path, views)
  select created_at::date, path, count(*)
  from page_views
  where created_at < now() - (retention_days || ' days')::interval
  group by created_at::date, path
  on conflict (day, path)
  do update set views = page_view_daily.views + excluded.views;
  delete from page_views
  where created_at < now() - (retention_days || ' days')::interval;
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;
grant execute on function rollup_page_views(int) to anon, authenticated;

-- 3. One-off backfill: aggregate ALL current raw rows into page_view_daily
-- and delete them. The check aborts the whole block (nothing deleted) if
-- the daily sum comes up short of the raw count — visits are never lost.
-- On a first run page_view_daily starts empty, so the sums must match.
do $$
declare
  raw_count bigint;
  daily_sum bigint;
begin
  select count(*) into raw_count from page_views;
  insert into page_view_daily (day, path, views)
  select created_at::date, path, count(*)
  from page_views
  group by created_at::date, path
  on conflict (day, path)
  do update set views = page_view_daily.views + excluded.views;
  select coalesce(sum(views), 0) into daily_sum from page_view_daily;
  if raw_count > 0 and daily_sum < raw_count then
    raise exception 'page_view_daily backfill mismatch: daily sum % < raw count %', daily_sum, raw_count;
  end if;
  delete from page_views;
end $$;

-- 4. Verification — eyeball these three numbers after running:
--    raw_rows_remaining should be 0, lifetime_daily_total should equal the
--    old raw count (7,899 on 2026-11-13), and both functions must exist.
select
  (select count(*) from page_views) as raw_rows_remaining,
  (select coalesce(sum(views), 0) from page_view_daily) as lifetime_daily_total,
  (select count(*) from page_view_daily) as daily_rows;
select proname from pg_proc where proname in ('rollup_page_views', 'prune_page_views');
