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
-- NOTE: After running this, create your admin login user
-- from Supabase Dashboard -> Authentication -> Users -> Add User
-- (email + password). Only users created there can log in to /admin.
-- =========================================================
