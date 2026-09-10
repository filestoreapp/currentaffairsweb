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

## 10. Customization ideas

- Add a search bar (Supabase full-text search on `posts.title`/`content_html`)
- Add a "Quiz of the day" or PDF download section for PSC study material
- Add view-count tracking (the `posts.views` column already exists)
- Add a newsletter signup
- Swap the color theme in Tailwind (`indigo` is used throughout — search &
  replace with your brand color)
