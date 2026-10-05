-- PSC category directory: one page per PSC category number (e.g. 427/2024).
-- The admin imports announcements from keralapsc.gov.in/latest, sets exam
-- dates for the countdown, and uploads question papers / answer keys per
-- section after exams. Public reads published rows only.

create table if not exists psc_categories (
  id uuid primary key default gen_random_uuid(),
  cat_no text not null unique,
  slug text not null unique,
  post_name text not null,
  department text,
  announcement_type text,
  list_no text,
  list_date date,
  exam_date date,
  details text,
  source_url text,
  paper_sections jsonb not null default '[]',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists psc_categories_slug_idx on psc_categories (slug);
create index if not exists psc_categories_exam_date_idx on psc_categories (exam_date);

drop trigger if exists psc_categories_set_updated_at on psc_categories;
create trigger psc_categories_set_updated_at
before update on psc_categories
for each row execute function set_updated_at();

alter table psc_categories enable row level security;

drop policy if exists "public read published psc_categories" on psc_categories;
create policy "public read published psc_categories"
on psc_categories for select to anon
using (is_published = true);

drop policy if exists "admins manage psc_categories" on psc_categories;
create policy "admins manage psc_categories"
on psc_categories for all to authenticated
using (true) with check (true);
