-- =========================================================
-- PSC Current Affairs - Supabase Schema
-- Run this whole file in Supabase Dashboard -> SQL Editor
-- =========================================================

-- 1. CATEGORIES ------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- 2. POSTS -------------------------------------------------------
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content_html text not null default '',      -- rendered HTML from rich text editor
  content_markdown text,                       -- raw markdown, if written in markdown mode
  editor_mode text not null default 'richtext' check (editor_mode in ('richtext','markdown')),
  cover_image text,
  category_id uuid references categories(id) on delete set null,
  tags text[] default '{}',
  status text not null default 'draft' check (status in ('draft','published','scheduled')),
  published_at timestamptz,
  meta_title text,
  meta_description text,
  views integer not null default 0,
  telegram_posted boolean not null default false,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_idx on posts (status, published_at desc);
create index if not exists posts_category_idx on posts (category_id);
create index if not exists posts_slug_idx on posts (slug);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists posts_set_updated_at on posts;
create trigger posts_set_updated_at
before update on posts
for each row execute function set_updated_at();

-- 3. ROW LEVEL SECURITY --------------------------------------
alter table posts enable row level security;
alter table categories enable row level security;

-- Public (anon) can read published posts only
drop policy if exists "public read published posts" on posts;
create policy "public read published posts"
on posts for select
to anon
using (status = 'published' and (published_at is null or published_at <= now()));

-- Logged-in users (admins) can do everything on posts
drop policy if exists "admins manage posts" on posts;
create policy "admins manage posts"
on posts for all
to authenticated
using (true)
with check (true);

-- Categories: public can read all, admins can manage
drop policy if exists "public read categories" on categories;
create policy "public read categories"
on categories for select
to anon
using (true);

drop policy if exists "admins manage categories" on categories;
create policy "admins manage categories"
on categories for all
to authenticated
using (true)
with check (true);

-- 4. STORAGE BUCKET FOR IMAGES --------------------------------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "public read post images" on storage.objects;
create policy "public read post images"
on storage.objects for select
to public
using (bucket_id = 'post-images');

drop policy if exists "authenticated upload post images" on storage.objects;
create policy "authenticated upload post images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'post-images');

drop policy if exists "authenticated manage post images" on storage.objects;
create policy "authenticated manage post images"
on storage.objects for update
to authenticated
using (bucket_id = 'post-images');

drop policy if exists "authenticated delete post images" on storage.objects;
create policy "authenticated delete post images"
on storage.objects for delete
to authenticated
using (bucket_id = 'post-images');

-- 5. SEED CATEGORIES -------------------------------------------
insert into categories (name, slug, description) values
  ('Kerala', 'kerala', 'Kerala current affairs'),
  ('National', 'national', 'National current affairs'),
  ('International', 'international', 'International current affairs'),
  ('Sports', 'sports', 'Sports current affairs'),
  ('Science & Tech', 'science-tech', 'Science and technology updates'),
  ('Obituary', 'obituary', 'Notable deaths'),
  ('Appointments', 'appointments', 'New appointments'),
  ('Awards', 'awards', 'Awards and honours')
on conflict (slug) do nothing;

-- =========================================================
-- 6. QUIZZES
-- =========================================================
create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  post_id uuid references posts(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists quizzes_set_updated_at on quizzes;
create trigger quizzes_set_updated_at
before update on quizzes
for each row execute function set_updated_at();

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  question text not null,
  options text[] not null,
  correct_index int not null,
  explanation text,
  position int not null default 0
);

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  name text not null,
  score int not null,
  total int not null,
  created_at timestamptz not null default now()
);

create index if not exists quiz_questions_quiz_idx on quiz_questions (quiz_id, position);
create index if not exists quiz_attempts_quiz_idx on quiz_attempts (quiz_id, score desc);
create index if not exists quizzes_post_idx on quizzes (post_id);

alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_attempts enable row level security;

drop policy if exists "public read published quizzes" on quizzes;
create policy "public read published quizzes"
on quizzes for select to anon
using (status = 'published');

drop policy if exists "admins manage quizzes" on quizzes;
create policy "admins manage quizzes"
on quizzes for all to authenticated
using (true) with check (true);

drop policy if exists "public read quiz questions" on quiz_questions;
create policy "public read quiz questions"
on quiz_questions for select to anon
using (true);

drop policy if exists "admins manage quiz questions" on quiz_questions;
create policy "admins manage quiz questions"
on quiz_questions for all to authenticated
using (true) with check (true);

drop policy if exists "public read attempts" on quiz_attempts;
create policy "public read attempts"
on quiz_attempts for select to anon
using (true);

drop policy if exists "public insert attempts" on quiz_attempts;
create policy "public insert attempts"
on quiz_attempts for insert to anon
with check (true);

drop policy if exists "admins manage attempts" on quiz_attempts;
create policy "admins manage attempts"
on quiz_attempts for all to authenticated
using (true) with check (true);

-- =========================================================
-- 7. PAGE VIEW TRACKING (for admin statistics chart)
-- =========================================================
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_idx on page_views (created_at);

alter table page_views enable row level security;

drop policy if exists "public insert page views" on page_views;
create policy "public insert page views"
on page_views for insert to anon
with check (true);

drop policy if exists "admins read page views" on page_views;
create policy "admins read page views"
on page_views for select to authenticated
using (true);

-- Security-definer function so anonymous visitors can increment a post's
-- view count without being granted direct UPDATE access to the posts table.
create or replace function increment_post_views(post_slug text)
returns void as $$
begin
  update posts set views = views + 1
  where slug = post_slug and status = 'published';
end;
$$ language plpgsql security definer;

grant execute on function increment_post_views(text) to anon;

-- =========================================================
-- 8. PSC AUTO-UPDATES (scraped from keralapsc.gov.in)
-- =========================================================
create table if not exists psc_updates (
  id uuid primary key default gen_random_uuid(),
  source text not null,                 -- e.g. 'notifications', 'examination_notification', 'syllabus', 'exam_programme', 'result_notifications', 'shortlists', 'rankedlist', 'interviews'
  title text not null,
  source_url text not null unique,      -- the keralapsc.gov.in page/node link (or pdf url if no node page) - used to dedupe
  pdf_url text,                         -- direct PDF download link, when available
  category_number text,                 -- e.g. "CAT.NO : 130/2026" when present
  published_on date,                    -- date as shown on the PSC site, when parseable
  scraped_at timestamptz not null default now(),
  telegram_posted boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists psc_updates_source_idx on psc_updates (source, scraped_at desc);
create index if not exists psc_updates_scraped_idx on psc_updates (scraped_at desc);

alter table psc_updates enable row level security;

drop policy if exists "public read psc updates" on psc_updates;
create policy "public read psc updates"
on psc_updates for select to anon
using (true);

-- Only the service role (used by the cron route) writes here, so there is
-- deliberately no insert/update policy for anon or authenticated users.
-- The admin dashboard reads through the authenticated policy below.
drop policy if exists "admins read psc updates" on psc_updates;
create policy "admins read psc updates"
on psc_updates for select to authenticated
using (true);

-- =========================================================
-- 9. QUIZ CATEGORY / DIFFICULTY / TIMER
-- =========================================================
alter table quizzes add column if not exists category_id uuid references categories(id) on delete set null;
alter table quizzes add column if not exists difficulty text not null default 'medium';
alter table quizzes add column if not exists time_limit_seconds integer; -- null = untimed

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'quizzes_difficulty_check'
  ) then
    alter table quizzes add constraint quizzes_difficulty_check
      check (difficulty in ('easy', 'medium', 'hard'));
  end if;
end $$;

create index if not exists quizzes_category_idx on quizzes (category_id);

-- =========================================================
-- 10. POST REVISION HISTORY (editor workflow: undo/restore)
-- =========================================================
-- One row is inserted here automatically every time an existing post is
-- updated (a snapshot of its state right BEFORE the new changes are
-- applied), so editors can see and restore earlier versions. Older rows
-- beyond the most recent 20 per post are pruned automatically by the app
-- after each save, so this table doesn't grow without bound.
create table if not exists post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  title text not null,
  excerpt text,
  content_html text not null default '',
  content_markdown text,
  editor_mode text not null default 'richtext',
  cover_image text,
  category_id uuid references categories(id) on delete set null,
  tags text[] default '{}',
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now()
);

create index if not exists post_revisions_post_idx on post_revisions (post_id, created_at desc);

alter table post_revisions enable row level security;

-- Revisions are only ever written/read by logged-in admins — no public
-- access at all (unlike posts/categories, there's no anon select policy).
drop policy if exists "admins manage post revisions" on post_revisions;
create policy "admins manage post revisions"
on post_revisions for all to authenticated
using (true) with check (true);

-- =========================================================
-- 14. MOCK TEST MODE (extends quizzes)
-- =========================================================
-- A mock test is a quiz with is_mock = true: exam-style runner with a
-- question palette, countdown timer, negative marking, per-question
-- review and a ranked leaderboard (score desc, fastest first).
alter table quizzes add column if not exists is_mock boolean not null default false;
alter table quizzes add column if not exists negative_marking numeric not null default 0;
alter table quizzes add column if not exists instructions text;

alter table quiz_attempts add column if not exists correct_count int not null default 0;
alter table quiz_attempts add column if not exists wrong_count int not null default 0;
alter table quiz_attempts add column if not exists skipped_count int not null default 0;
alter table quiz_attempts add column if not exists time_taken_seconds int;
alter table quiz_attempts add column if not exists answers jsonb;

-- Fractional scores (negative marking) need numeric instead of int.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'quiz_attempts'
      and column_name = 'score'
      and data_type = 'integer'
  ) then
    alter table quiz_attempts alter column score type numeric using score::numeric;
  end if;
end $$;

create index if not exists quizzes_is_mock_idx on quizzes (is_mock, status);
create index if not exists quiz_attempts_mock_rank_idx
  on quiz_attempts (quiz_id, score desc, time_taken_seconds asc nulls last);

-- =========================================================
-- NOTE: After running this, create your admin login user
-- from Supabase Dashboard -> Authentication -> Users -> Add User
-- (email + password). Only users created there can log in to /admin.
-- =========================================================
