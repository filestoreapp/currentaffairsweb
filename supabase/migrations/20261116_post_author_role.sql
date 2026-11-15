-- Visible author/editor role on current-affairs posts (2026-11-16).
-- "admin" = created/checked by the site's editorial pipeline (Cosmo and the
-- automated digest/bulk flows); "owner" = the site owner wrote it himself.
-- Role word only — a personal name must NEVER appear on any public page.
-- The column defaults to "admin" so worker-created posts (create-post /
-- digest pipeline, which never send this field) are Admin automatically;
-- the admin PostForm sends an explicit value (default Owner) for manual posts.
-- Apply manually in the Supabase SQL Editor (as with all migrations in
-- this project). After applying, apply 20261116_post_author_role_seed.sql
-- for the backfill.
alter table posts add column if not exists author_role text
  check (author_role in ('admin', 'owner')) default 'admin';
