-- 2026-09-28: Exam hub pages
-- Run this in the Supabase SQL editor (one copy-paste). Creates the `exams`
-- table, adds `exam_slug` tagging columns to quizzes + psc_updates, and seeds
-- four major Kerala PSC exams. Safe to re-run (if not exists / on conflict).

create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text not null,
  department text,
  category_no text,
  qualification text,
  age_limit text,
  pay_scale text,
  vacancy text,
  notification_date date,
  admit_card_date date,
  exam_date date,
  result_date date,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'ongoing', 'completed')),
  description text,
  syllabus jsonb not null default '[]',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Question Paper Code (e.g. 87/2026): assigned by Kerala PSC when the
-- written exam is scheduled; shown on the exam hub next to Category No.
alter table exams add column if not exists question_paper_code text;

drop trigger if exists exams_set_updated_at on exams;
create trigger exams_set_updated_at
before update on exams
for each row execute function set_updated_at();

alter table exams enable row level security;

drop policy if exists "public read published exams" on exams;
create policy "public read published exams"
on exams for select to anon
using (is_published = true);

drop policy if exists "admins manage exams" on exams;
create policy "admins manage exams"
on exams for all to authenticated
using (true) with check (true);

-- Optional tag linking quizzes/mocks/PYQs and PSC updates to an exam hub.
alter table quizzes add column if not exists exam_slug text;
alter table psc_updates add column if not exists exam_slug text;
create index if not exists quizzes_exam_slug_idx on quizzes (exam_slug);
create index if not exists psc_updates_exam_slug_idx on psc_updates (exam_slug);

-- Seed: four major exams. Pay scale / vacancy / dates left NULL on purpose —
-- fill them in from the official notification via Admin → Exams.
insert into exams (slug, name, short_name, department, qualification, age_limit, description, syllabus) values
(
  'ldc',
  'Lower Division Clerk',
  'LDC',
  'Various Government Departments',
  'SSLC (10th standard)',
  '18–36 years',
  'The Lower Division Clerk exam is Kerala PSC''s most popular 10th-level recruitment, filling clerical posts across government departments. Selection is through a written OMR exam covering general knowledge, reasoning, aptitude and languages.',
  '[{"section":"General Knowledge & Current Affairs","topics":["Kerala history, culture & geography","Indian polity, economy & constitution","National & international current affairs"]},{"section":"Reasoning & Mental Ability","topics":["Analogies & classification","Coding-decoding","Series completion"]},{"section":"Quantitative Aptitude","topics":["Percentages, ratios & averages","Time, work & distance","Simple interest"]},{"section":"General English","topics":["Grammar & error spotting","Vocabulary","Comprehension"]},{"section":"Regional Language","topics":["Malayalam / Tamil / Kannada grammar","Comprehension"]}]'::jsonb
),
(
  'lgs',
  'Last Grade Servants',
  'LGS',
  'Various Government Departments',
  'VII standard',
  '18–36 years',
  'The Last Grade Servants exam recruits office attendants and similar posts across Kerala government departments. It is the entry-level PSC exam with the largest applicant pool.',
  '[{"section":"General Knowledge","topics":["Kerala basics: districts, rivers, festivals","Indian history & freedom movement"]},{"section":"Current Affairs","topics":["Kerala & national current affairs","Awards, sports & appointments"]},{"section":"General Science","topics":["Everyday science","Human body & environment"]},{"section":"Simple Arithmetic & Reasoning","topics":["Number series","Basic arithmetic","Odd one out"]}]'::jsonb
),
(
  'university-assistant',
  'University Assistant',
  'University Assistant',
  'Universities in Kerala',
  'Bachelor''s Degree',
  '18–36 years',
  'University Assistant is a sought-after degree-level post in Kerala''s universities, with office administration duties. The exam tests degree-level general knowledge, reasoning, aptitude and English.',
  '[{"section":"General Knowledge & Current Affairs","topics":["Kerala renaissance & history","Indian polity & governance","Current affairs"]},{"section":"Reasoning & Mental Ability","topics":["Logical reasoning","Blood relations","Direction sense"]},{"section":"Quantitative Aptitude","topics":["Arithmetic","Data interpretation basics"]},{"section":"General English","topics":["Grammar","Vocabulary & idioms","Comprehension"]}]'::jsonb
),
(
  'police-constable',
  'Police Constable',
  'Police Constable',
  'Kerala Police',
  'SSLC (10th standard)',
  '18–26 years',
  'Police Constable recruitment for the Kerala Police (Civil Police Officer / Armed Police Battalion) involves a written exam followed by physical efficiency tests and medical examination.',
  '[{"section":"General Knowledge & Current Affairs","topics":["Kerala & Indian current affairs","Indian constitution & law basics"]},{"section":"Reasoning","topics":["Analogies","Series","Coding-decoding"]},{"section":"Numerical Ability","topics":["Basic arithmetic","Percentages & averages"]},{"section":"General English","topics":["Grammar","Vocabulary"]}]'::jsonb
)
on conflict (slug) do nothing;
