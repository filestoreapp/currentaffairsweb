# PSC Current Affairs

A modern, full-stack current affairs / blog website for Kerala PSC exam
preparation — built with **Next.js 16**, **Tailwind CSS**, and **Supabase**
(Postgres + Auth + Storage). Includes a full admin panel (like Blogger/WordPress)
with a rich-text **and** markdown editor, image uploads, categories/tags, SEO
fields, and a ready-to-wire **Telegram auto-post hook**.

---

## 1. Features

**Public site**
- Modern homepage with hero + latest posts
- `/current-affairs` — paginated listing of all published posts
- `/category/[slug]` — posts filtered by category
- `/current-affairs/[slug]` — full article page with SEO meta tags
- Auto-generated `sitemap.xml` and `robots.txt`
- Fully responsive, mobile-first design

**Admin panel** (`/admin`, protected by Supabase Auth)
- Dashboard with post stats (published / draft counts)
- Create / edit / delete posts
- **Two editor modes** you can switch between per-post:
  - Rich text editor (Tiptap) — bold, italic, underline, headings, lists,
    quotes, links, inline images, undo/redo — like Blogger/WordPress
  - Markdown editor with live preview
- Cover image + inline image uploads (stored in Supabase Storage)
- Categories manager (add/delete)
- Tags, excerpt, custom slug
- SEO fields: meta title & meta description
- Draft / Published status
- **Telegram auto-post placeholder** — silently does nothing until you add a
  bot token later (see section 5)

---

## 2. Prerequisites

- Node.js 20+
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account
- Git + a GitHub account (for deploying to Vercel)

---

## 3. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com/dashboard).
2. Go to **SQL Editor** → paste the entire contents of
   `supabase/schema.sql` → click **Run**.
   This creates the `posts` and `categories` tables, row-level security
   policies, a public `post-images` storage bucket, and seeds a few
   default categories (Kerala, National, Sports, etc.)
3. Go to **Authentication → Users → Add user** and create your admin
   login (email + password). This is the only account that can log in
   to `/admin` — there is no public sign-up.
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 4. Local development

```bash
npm install
cp .env.local.example .env.local
# edit .env.local and paste your Supabase URL + anon key
npm run dev
```

Visit `http://localhost:3000` for the site and `http://localhost:3000/admin`
to log in.

---

## 5. Telegram channel integration (future)

The code already has a hook at `src/lib/telegram.ts` and it's called
automatically whenever a post is published. It does nothing until you:

1. Message @BotFather on Telegram → `/newbot` → copy the bot token.
2. Add your new bot as an **admin** of your Telegram channel.
3. Get your channel's `@username` (or numeric chat id).
4. Add these environment variables (locally in `.env.local`, and in Vercel
   under **Project Settings → Environment Variables**):
   ```
   TELEGRAM_BOT_TOKEN=123456:ABC-your-bot-token
   TELEGRAM_CHANNEL_ID=@your_channel_username
   TELEGRAM_ENABLED=true
   ```
5. That's it — no code changes needed. Every time you publish a post, it
   will automatically be sent to your Telegram channel.

---

## 6. Deploying to Vercel

1. Push this project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```
2. Go to vercel.com/new and import the repo.
3. Add the environment variables from your `.env.local` file (and the
   Telegram ones later, when ready) under **Environment Variables**.
4. Set `NEXT_PUBLIC_SITE_URL` to your final Vercel domain (or custom
   domain), e.g. `https://your-site.vercel.app`.
5. Click **Deploy**. Done — your site and admin panel are live.

---

## 7. Project structure

```
src/
  app/
    (site)/              # public pages (home, current-affairs, category)
    admin/                # protected admin panel (login, dashboard, posts, categories)
    sitemap.ts, robots.ts
  components/
    site/                 # Header, Footer, PostCard
    admin/                # Sidebar, PostForm, RichTextEditor, MarkdownEditor, ImageUploader, CategoriesManager
  lib/
    supabase/             # client/server/middleware helpers
    actions/              # server actions (auth, posts CRUD, image upload)
    posts.ts              # data-fetching helpers
    telegram.ts           # Telegram auto-post hook (placeholder)
    types.ts
supabase/
  schema.sql              # run this once in Supabase SQL editor
```

---

## 8. Adding more admins

Just add more users from **Supabase Dashboard → Authentication → Users**.
Every authenticated user has full admin access (create/edit/delete
posts & categories).

## 9. Quizzes & Statistics (added after initial launch)

If you're updating an existing deployment, just re-run the **entire**
`supabase/schema.sql` file again in the Supabase SQL Editor — it's
written to be safe to re-run (`create table if not exists`, `drop
policy if exists`) and will only add the new `quizzes`,
`quiz_questions`, `quiz_attempts` and `page_views` tables plus the
`increment_post_views` function, without touching your existing posts.

**Quizzes**
- Manage from `/admin/quizzes` — create a quiz, add questions (4
  options each, pick the correct one, optional explanation), and
  either leave it standalone or attach it to a specific post.
- Standalone quizzes show up at `/quiz`. Quizzes attached to a post
  show a "Test yourself on this article" card at the bottom of that
  post.
- Visitors type their name, answer one question at a time with
  instant feedback, and see a leaderboard (top 10 scores) at the end.
  There's no login — scores are self-reported client-side, which is
  fine for casual practice quizzes but not tamper-proof, so don't use
  this for anything that needs to be cheat-proof.

**Statistics**
- `/admin/statistics` shows total post views, visits in the last 30
  days (with a chart), quiz attempt counts, average quiz scores, your
  5 most-viewed posts, and per-quiz performance.
- Visit tracking is a lightweight built-in page-view logger (no
  external analytics account needed) — every page load writes one row
  to the `page_views` table.

## 10. PSC auto-updates (added after initial launch)

The site can auto-pull the latest **notifications, examination
notifications, postwise syllabus, exam programme, result notifications,
short lists, ranked lists and interview schedules** straight from
`keralapsc.gov.in`, with no manual posting.

**Setup**

1. Re-run `supabase/schema.sql` in the Supabase SQL editor (it's
   idempotent — this adds the new `psc_updates` table without touching
   anything else).
2. In Supabase, go to **Project Settings → API** and copy the
   **`service_role`** key → set it as `SUPABASE_SERVICE_ROLE_KEY` (locally
   in `.env.local`, and in Vercel under Environment Variables). This key
   bypasses Row Level Security and is only ever used server-side by the
   scraper — never expose it to the browser.
3. Pick any long random string and set it as `CRON_SECRET` in the same
   two places. Vercel automatically sends it as
   `Authorization: Bearer $CRON_SECRET` when its Cron scheduler calls the
   route, so no extra wiring is needed.
4. Deploy. `vercel.json` registers a daily cron
   (`/api/cron/psc-scrape`, `0 3 * * *` UTC ≈ 8:30am IST). Vercel's
   **free Hobby plan only allows once-a-day cron schedules** — if you
   want it to check more often, either upgrade to Pro (unlocks
   per-minute schedules) or point a free external scheduler (e.g.
   [cron-job.org](https://cron-job.org)) at
   `https://your-site.vercel.app/api/cron/psc-scrape` with header
   `Authorization: Bearer <your CRON_SECRET>` on whatever cadence you
   like — the route itself has no rate limit of its own.
5. New items found on a scrape are also sent to your Telegram channel
   automatically, using the same `TELEGRAM_*` env vars from section 5.

**Using it**

- Public page: `/psc-updates` — filterable by category, shows a "NEW"
  badge for anything scraped in the last 48 hours, direct PDF download
  links where available.
- Admin page: `/admin/psc-updates` — per-source counts, most recently
  scraped items, and a **"Run scrape now"** button to trigger it on
  demand instead of waiting for the schedule.
- Debug endpoint: `GET /api/cron/psc-scrape?dry_run=1` (same auth
  header) fetches and parses every source **without** writing to the
  database or Telegram — useful for checking the scraper still matches
  Kerala PSC's page markup if they redesign something.

**How it works / limitations**

The scraper (`src/lib/psc-scraper/`) fetches each listing page on
`keralapsc.gov.in` fresh on every run and parses it generically — by
walking `<table>`/`<tr>`/`<td>`/`<a>` structure rather than relying on
Kerala PSC's specific CSS classes, since those weren't available to
verify against ahead of time. This should be resilient to minor styling
changes, but if a page's HTML structure changes significantly, check it
with the `dry_run=1` endpoint above and adjust `src/lib/psc-scraper/parse.ts`
if needed. New rows are deduped by URL, so re-running the scraper
(including overlapping cron + manual runs) is always safe.

## 11. Scheduled posts

Set a post's status to **Scheduled** in the editor and pick a date/time —
it becomes publicly visible automatically once that time passes (the
public queries check `published_at <= now()`), no redeploy or manual step
needed.

One caveat: the Telegram auto-post for a scheduled post only fires if you
open and re-save it as Published after the time passes — there's no cron
flipping the status label for you (this project already uses its one
Vercel Hobby cron slot for the PSC scraper). If you want Telegram alerts
to fire exactly on schedule too, the cleanest fix is a second cron route
that queries for `status = 'scheduled' AND published_at <= now()`, flips
them to `published`, and calls `postToTelegram` — happy to add that if
you end up wanting it.

## 12. Automatic post thumbnails

Every post now always has a cover image — no more "No image" placeholder
cards on the homepage or listing pages.

**How it works**

- When you publish or update a post in `/admin` **without** uploading a
  cover image, the server automatically renders a branded thumbnail (site
  name, category badge, and the post title on a gradient background) and
  stores it in the same `post-images` Supabase bucket used for manual
  uploads. It's a real PNG file with a real URL — it works in the post
  card grid, the article hero image, `og:image` meta tags, JSON-LD, and
  Telegram (see below), exactly like a manually uploaded cover would.
- If you'd rather see it before saving, click **"Auto-generate thumbnail"**
  next to the cover image uploader in the post editor — it fills in the
  cover image field with a preview you can keep or replace.
- Uploading your own image always takes priority; the auto-generator only
  ever fills in the gap when the field is left empty.
- **Existing posts** created before this feature (or ones you never added a
  cover to) aren't touched automatically. Go to `/admin/posts` and click
  **"Generate missing thumbnails"** — it finds every post with no cover
  image and generates one in one pass.
- The generator lives in `src/lib/thumbnail.tsx` (the visual design) and
  `src/lib/actions/thumbnail.ts` (rendering + upload). To change the
  look — colors, logo, layout — edit `ThumbnailImage` in `thumbnail.tsx`;
  every code path (auto-generate on save, the editor preview button, and
  the bulk backfill) renders from that one component, so a single edit
  updates all of them.
- There's also a live preview endpoint, `/api/thumbnail?title=...&category=...`,
  used internally for the editor's preview button — you can also hit it
  directly if you ever want to generate a one-off image outside the CMS.

**Telegram channel posts now include the image too** — `postToTelegram`
sends the cover image as a photo with the post details as the caption
(falls back to a plain text message on the rare post that still has no
image at all), instead of a text-only message like before.

## 13. Editor workflow: autosave, version history, bulk actions

**Autosave drafts**
- While writing or editing a post, your in-progress changes are saved to
  the browser's local storage a couple of seconds after you stop typing —
  no server round-trip, so it works even offline.
- If you accidentally close the tab or your browser crashes mid-edit,
  reopening that same post (or "New Post") shows a banner offering to
  restore the unsaved draft, or discard it.
- The draft is cleared automatically once you actually save (Create/Update
  Post). It's purely a client-side safety net — it never touches the
  database, so there's nothing to clean up server-side.
- Implementation: `src/lib/useDraftAutosave.ts` (a small reusable hook),
  wired into `PostForm`.

**Version history**
- Every time you update an existing post, a snapshot of its *previous*
  state is saved automatically (title, content, cover image, category,
  tags, SEO fields).
- Click **"Version history"** at the top of the post editor to see every
  past snapshot with a timestamp, and restore any of them with one click.
  Restoring itself snapshots the current state first, so it's never a
  one-way trip.
- Only the most recent 20 snapshots per post are kept — older ones are
  pruned automatically after each save so the `post_revisions` table
  doesn't grow forever. Adjust `MAX_REVISIONS_PER_POST` in
  `src/lib/actions/posts.ts` if you want a different limit.
- Requires re-running `supabase/schema.sql` (section 10) — it's additive
  and safe to re-run on an existing database.

**Bulk actions**
- `/admin/posts` now has checkboxes on every row (plus a "select all" in
  the header). Selecting one or more posts shows a toolbar to **Publish**,
  **Move to draft**, or **Delete** all of them at once.
- Bulk-publishing skips Telegram auto-posting (to avoid firing off a burst
  of channel messages from one bulk action) — publish posts individually
  from the editor if you want each one announced.

## 14. Mock tests & leaderboards

Free full-length mock tests are the site's biggest traffic magnet — exam-style
practice with a timer, negative marking and ranked leaderboards, no login needed.

**Creating a mock test**

- In `/admin/quizzes`, create a quiz as usual, then tick **"Mock test mode"**.
- Set a **time limit** (minutes), pick **negative marking** (none, −1/4, −1/3, −1/2),
  and write the **instructions** shown before the test starts.
- Publish — mocks get their own listing at `/mock-tests` (they don't appear
  under `/quiz`), and publishing a mock automatically announces it on your
  Telegram channel with the question count, duration and marking scheme
  (same `TELEGRAM_*` env vars, no extra setup).

**The test experience** (`/mock-tests/[slug]`)

- Intro screen: name entry, question count, duration, marking scheme, instructions.
- Exam runner: numbered **question palette** (answered / marked-for-review /
  unanswered), countdown timer with auto-submit on timeout, prev/next navigation,
  click-again-to-clear answers — no instant feedback, just like the real exam.
- Submit confirmation shows how many you answered before locking in.
- Results: score with negative marking applied, correct/wrong/skipped counts,
  accuracy %, time taken, your **rank**, a full **answer review** (your answer vs
  the correct one + explanations), and the test leaderboard (ties broken by
  fastest finish).
- `/mock-tests` also shows an **overall leaderboard** ranked by average best
  score across all mocks — rewards consistent performers.

**Database** — re-run `supabase/schema.sql` (section 14, additive and safe):
adds `is_mock`, `negative_marking`, `instructions` to `quizzes`; per-question
`answers` plus `correct_count`/`wrong_count`/`skipped_count`/`time_taken_seconds`
to `quiz_attempts`; and widens `quiz_attempts.score` to numeric for fractional
scores. Public read/insert RLS policies are unchanged from the quiz system.

## 15. PYQ papers, syllabus tracker & daily streaks

Three retention features that keep aspirants coming back every day.

**PYQ papers** (`/pyqs`) — previous-year Kerala PSC papers playable in the
same exam-style runner as mock tests (palette, timer, negative marking,
ranked leaderboard). In `/admin/quizzes`, tick **"PYQ paper mode"** and set
the **exam name** (e.g. LDC) and **exam year**; the listing page gets year
filter chips. Publishing a PYQ paper announces it on Telegram with the exam
name/year, question count and marking scheme. PYQ papers don't appear under
`/quiz` or `/mock-tests`.

**Syllabus tracker** (`/syllabus`) — the Kerala PSC syllabus broken into
checkable topics across 6 sections (GK, Current Affairs, Renaissance,
Arithmetic, English, Malayalam). Progress is stored in the browser's
localStorage — no login, no database. Edit the static data in
`src/lib/syllabus.ts`.

**Daily streaks** — consecutive days with at least one quiz/mock/PYQ attempt,
computed from `quiz_attempts` (IST calendar days, top 10). Shown as a
"Daily streaks" leaderboard on `/mock-tests`. Streaks are live only if the
player attempted today or yesterday.

**Database** — re-run `supabase/schema.sql` (section 15, additive and safe):
adds `is_pyq`, `exam_name`, `exam_year` to `quizzes` plus two indexes. No
RLS changes needed.

## 16. Customization ideas

- Add a search bar (Supabase full-text search on `posts.title`/`content_html`)
- Add a "Quiz of the day" or PDF download section for PSC study material
- Add view-count tracking (the `posts.views` column already exists)
- Add a newsletter signup
- Swap the color theme in Tailwind (`indigo` is used throughout — search &
  replace with your brand color)
