-- 2026-11-15: Ranked-list search index + cut-off history
-- Run this in the Supabase SQL editor (one copy-paste). Safe to re-run.
-- Then run 20261115_ranked_lists_seed.sql to load the first 15 parsed
-- lists (1,333 entries). Until both files are applied, the site reads the
-- bundled seed instead (src/data/ranked-lists-seed.json) — search keeps
-- working either way; the DB is the durable home for the index.
--
-- Data source: official PSC ranked-list PDFs (keralapsc.gov.in), parsed by
-- scripts in ~/workspace/.../hidden_files/ranklists/. Date of birth is
-- never stored — only the public facts a "find my name" search needs.
--
-- Tables:
--   ranked_lists            one row per parsed ranked list
--   ranked_list_entries     one row per candidate (rank, register/serial
--                           number, name, marks, community, section)
--   cutoffs                 per-list, per-community derived cut-offs
--                           (last main-list rank + lowest main-list marks)
--   ranked_list_parse_queue new ranked-list PDFs waiting to be parsed
--                           (filled by the daily ranked-list-indexer cron)

-- 1. Ranked lists ---------------------------------------------------------
create table if not exists ranked_lists (
  id text primary key,
  psc_update_id uuid,
  category_number text,
  post text,
  list_no text,
  published_on date,
  pdf_url text not null unique,
  list_kind text not null default 'ranked_list',
  entry_count int not null default 0,
  main_count int not null default 0,
  has_marks boolean not null default false,
  parse_status text not null default 'parsed',
  parsed_at timestamptz not null default now()
);

alter table ranked_lists enable row level security;
drop policy if exists "public read ranked lists" on ranked_lists;
create policy "public read ranked lists"
  on ranked_lists for select to anon using (true);
drop policy if exists "admins manage ranked lists" on ranked_lists;
create policy "admins manage ranked lists"
  on ranked_lists for all to authenticated using (true) with check (true);

create index if not exists ranked_lists_category_idx
  on ranked_lists (category_number, published_on desc);
create index if not exists ranked_lists_published_idx
  on ranked_lists (published_on desc);

-- 2. Entries --------------------------------------------------------------
create table if not exists ranked_list_entries (
  id uuid primary key default gen_random_uuid(),
  ranked_list_id text not null references ranked_lists (id) on delete cascade,
  rank int not null,
  register_number text not null,
  name text not null,
  total_marks numeric,
  community text,
  list_section text not null default 'main',
  unique (ranked_list_id, list_section, rank)
);

alter table ranked_list_entries enable row level security;
drop policy if exists "public read ranked list entries" on ranked_list_entries;
create policy "public read ranked list entries"
  on ranked_list_entries for select to anon using (true);
drop policy if exists "admins manage ranked list entries" on ranked_list_entries;
create policy "admins manage ranked list entries"
  on ranked_list_entries for all to authenticated using (true) with check (true);

create index if not exists ranked_list_entries_regno_idx
  on ranked_list_entries (register_number);
-- Substring name search (e.g. "anjali" inside "ANJALI K").
create extension if not exists pg_trgm;
create index if not exists ranked_list_entries_name_trgm_idx
  on ranked_list_entries using gin (lower(name) gin_trgm_ops);

-- 3. Cut-offs --------------------------------------------------------------
create table if not exists cutoffs (
  id uuid primary key default gen_random_uuid(),
  category_number text,
  post text,
  ranked_list_id text references ranked_lists (id) on delete cascade,
  list_year int,
  community text not null,
  cutoff_marks numeric,
  cutoff_rank int,
  main_count int,
  unique (ranked_list_id, community)
);

alter table cutoffs enable row level security;
drop policy if exists "public read cutoffs" on cutoffs;
create policy "public read cutoffs"
  on cutoffs for select to anon using (true);
drop policy if exists "admins manage cutoffs" on cutoffs;
create policy "admins manage cutoffs"
  on cutoffs for all to authenticated using (true) with check (true);

create index if not exists cutoffs_category_idx
  on cutoffs (category_number, list_year desc);

-- 4. Parse queue (internal: no public read) -------------------------------
create table if not exists ranked_list_parse_queue (
  id uuid primary key default gen_random_uuid(),
  pdf_url text not null unique,
  category_number text,
  status text not null default 'pending',
  attempts int not null default 0,
  error text,
  created_at timestamptz not null default now()
);

alter table ranked_list_parse_queue enable row level security;
drop policy if exists "admins manage ranked list parse queue" on ranked_list_parse_queue;
create policy "admins manage ranked list parse queue"
  on ranked_list_parse_queue for all to authenticated using (true) with check (true);

-- 5. Verification — eyeball after running:
select
  (select count(*) from ranked_lists) as ranked_lists,
  (select count(*) from ranked_list_entries) as entries,
  (select count(*) from cutoffs) as cutoffs;
