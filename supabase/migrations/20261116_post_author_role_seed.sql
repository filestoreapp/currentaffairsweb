-- Backfill for the author_role column (2026-11-16). Apply AFTER
-- 20261116_post_author_role.sql.
--
-- Rule: digest posts and the freedom-fighter series were created by the
-- automated pipeline → Admin. Everything else → Owner, unless the data
-- shows otherwise. (The bulk evergreen series were also pipeline-published,
-- but they carry no reliable marker in the data, so they take Owner here;
-- individual posts can be flipped to Admin from the admin PostForm.)
-- Digest detection: the daily-digest tag or the daily-current-affairs-* slug
-- (the digest cron always uses that slug). Fighter posts use the
-- freedom-fighter-* slug.
update posts
set author_role = 'admin'
where 'daily-digest' = any (tags)
   or slug like 'daily-current-affairs-%'
   or slug like 'freedom-fighter-%';

update posts
set author_role = 'owner'
where author_role is null
   or author_role not in ('admin', 'owner')
   or not ('daily-digest' = any (tags)
          or slug like 'daily-current-affairs-%'
          or slug like 'freedom-fighter-%');
