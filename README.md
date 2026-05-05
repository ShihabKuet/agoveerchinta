# আগোভীর চিন্তা — AgoveerChinta

> বাংলায় ভাবি, বাংলায় লিখি

A Bengali newspaper-style blog platform built with **Next.js 14**, **Supabase**, and **Tailwind CSS**. Deployable for free on Vercel + Supabase.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) | SSR for SEO, fast static pages |
| Styling | Tailwind CSS | Newspaper design tokens |
| Database | Supabase (PostgreSQL) | Free tier, realtime, RLS security |
| Auth | Supabase Auth | Email + Google OAuth built-in |
| Storage | Supabase Storage | CDN-backed image hosting |
| Editor | Tiptap | Rich text Bengali editing |
| Deployment | Vercel | Free, auto-deploy from GitHub |

---

## 🚀 Setup in 5 Steps

### Step 1 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → Sign up → **New Project**
2. Name it `agoveerchinta`, choose a region close to Bangladesh (Singapore works well)
3. Save the **database password** somewhere safe
4. Wait ~2 minutes for the project to spin up

### Step 2 — Run Database Migrations

In your Supabase Dashboard → **SQL Editor** → **New Query**:

1. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` → Paste → **Run**
2. Copy the entire contents of `supabase/migrations/002_rpc_functions.sql` → Paste → **Run**

You should see "Success" for both. This creates all tables, indexes, security policies, and seed categories.

### Step 3 — Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase credentials:
- **NEXT_PUBLIC_SUPABASE_URL** → Supabase Dashboard → Settings → API → Project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** → Settings → API → `anon` `public` key
- **SUPABASE_SERVICE_ROLE_KEY** → Settings → API → `service_role` key (keep secret!)
- **NEXT_PUBLIC_SITE_URL** → `http://localhost:3000` for local, your domain for production

### Step 4 — Install & Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the newspaper homepage!

### Step 5 — Deploy to Vercel (Free)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — AgoveerChinta v1.0"
   git remote add origin https://github.com/YOUR_USERNAME/agoveerchinta.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo

3. In Vercel's environment variables, add the same 4 variables from your `.env.local`

4. Click **Deploy** — your site is live in ~90 seconds! 🎉

---

## 📝 Writing Your First Post

### Via Admin Panel (UI editor)
1. Go to `yoursite.com/admin/editor`
2. Write in Bengali using the rich text editor
3. Set category, feature image, etc. in the right panel
4. Click **প্রকাশ করুন** (Publish)

### Via Supabase Dashboard (direct DB entry)
1. Supabase Dashboard → **Table Editor** → `posts`
2. Click **Insert row**
3. Fill in: `title`, `slug` (URL key), `body_text`, `status: published`, `author_id` (your user ID)

---

## 📁 Project Structure

```
agoveerchinta/
├── app/
│   ├── (public)/              # All reader-facing pages
│   │   ├── page.tsx           # Newspaper homepage
│   │   ├── [slug]/            # Individual post
│   │   ├── category/[name]/   # Category listing
│   │   ├── tag/[slug]/        # Tag listing
│   │   └── search/            # Search page
│   ├── (admin)/               # Writer panel
│   │   ├── admin/page.tsx     # Dashboard
│   │   ├── admin/editor/      # Tiptap rich text editor
│   │   └── admin/manage/      # Post management table
│   └── api/                   # Backend API routes
│       ├── posts/             # CRUD for posts
│       ├── likes/             # Like/unlike
│       ├── comments/          # Comment CRUD
│       ├── polls/             # Poll voting
│       └── views/             # View count tracking
├── components/
│   ├── layout/                # Header, Footer
│   ├── post/                  # PostCard, PostGrid
│   ├── sidebar/               # Sidebar with all widgets
│   ├── interactions/          # Like, Share, Comment, ViewTracker
│   └── ui/                   # SearchBar and shared UI
├── lib/
│   ├── supabase.ts            # DB client setup
│   ├── utils.ts               # Bengali date/number helpers
│   └── db/                   # All database query functions
├── types/index.ts             # All TypeScript types
└── supabase/migrations/       # SQL schema files
```

---

## 🗺️ Roadmap

| Version | Features | Status |
|---------|----------|--------|
| **v1.0** | Homepage, posts, categories, sidebar, search, admin editor | ✅ **Done** |
| **v1.5** | Supabase Auth login, user accounts, like/comment auth enforcement | 🔜 Next |
| **v2.0** | Polls, charts/graphs, কবিতা/গল্প pages, book reviews, downloads | 🔜 |
| **v2.5** | RSS feed, Bengali full-text search, admin analytics dashboard | 🔜 |
| **v3.0** | Reader bookmarks, newsletter (Resend), multiple authors | 🔜 |

---

## 🆓 Free Tier Limits

| Service | Free Allowance |
|---------|---------------|
| Vercel | 100GB bandwidth/month, unlimited deploys |
| Supabase DB | 500MB storage |
| Supabase Auth | 50,000 monthly active users |
| Supabase Storage | 1GB for images |
| Supabase Bandwidth | 2GB/month |

This is enough to run the blog with thousands of readers per month for free.

---

## বাংলা Typography

The site uses two Google Fonts loaded via `next/font` (zero layout shift):
- **Noto Serif Bengali** — Headings, post titles, body text of literary pieces
- **Hind Siliguri** — UI elements, captions, navigation, meta text

---

*Built with ❤️ for Bengali readers everywhere.*
