-- "Why this matters for PSC" line on standalone current-affairs posts
-- (2026-11-15). One–two sentence exam-relevance note, stored per post and
-- rendered on the post page. Daily digest posts NEVER get a value here:
-- the render excludes digests by tag/slug even if a value were set.
-- Apply manually in the Supabase SQL Editor (as with all migrations in
-- this project). After applying, apply
-- 20261115_psc_relevance_seed.sql for the backfilled lines.
alter table posts add column if not exists psc_relevance text;
