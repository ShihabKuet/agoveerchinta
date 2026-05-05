-- ============================================================
--  AgoveerChinta — Database Schema v1.0
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";    -- Helps with search normalization
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Trigram search for Bengali full-text

-- ============================================================
-- PROFILES
-- Extends Supabase auth.users with public profile data.
-- We use a trigger to auto-create a profile when a user signs up.
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  bio         TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'author', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- CATEGORIES
-- Fixed list of Bengali blog categories.
-- ============================================================
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,   -- Bengali: সাহিত্য, রাজনীতি, etc.
  slug        TEXT NOT NULL UNIQUE,   -- URL-safe: sahitya, rajneeti, etc.
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#c0392b',  -- Accent color per category
  icon        TEXT,                  -- Emoji or icon name
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TAGS
-- Flexible labels for cross-category organization.
-- ============================================================
CREATE TABLE tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- POSTS
-- The central table. Everything links back to this.
-- ============================================================
CREATE TABLE posts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  excerpt           TEXT,                        -- Short summary for cards
  body              JSONB NOT NULL DEFAULT '{}', -- Tiptap JSON content
  body_text         TEXT,                        -- Plain text for search (auto-populated)
  feature_image_url TEXT,
  feature_image_alt TEXT,
  category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,   -- Shows in hero slot on homepage
  is_breaking       BOOLEAN NOT NULL DEFAULT FALSE,   -- Shows in breaking news ticker
  post_type         TEXT NOT NULL DEFAULT 'article'   -- article | poem | story | novel | book_review | download
                    CHECK (post_type IN ('article','poem','story','novel','book_review','download')),
  view_count        INTEGER NOT NULL DEFAULT 0,
  reading_time_min  INTEGER,                    -- Auto-calculated
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction table: many posts ↔ many tags
CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ============================================================
-- LIKES
-- One like per user per post. Enforced at DB level.
-- ============================================================
CREATE TABLE likes (
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)   -- Composite PK prevents duplicate likes
);

-- ============================================================
-- COMMENTS
-- Threaded: parent_id references the same table for replies.
-- ============================================================
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES comments(id) ON DELETE CASCADE,  -- NULL = top-level
  body        TEXT NOT NULL CHECK (length(body) > 0 AND length(body) <= 2000),
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,  -- Set FALSE to require moderation
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- POLLS
-- One poll per post (optional). Linked by post_id.
-- ============================================================
CREATE TABLE polls (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  question   TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE poll_options (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id    UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE poll_votes (
  poll_id    UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id  UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- NULL = anonymous
  ip_hash    TEXT,  -- For anonymous vote dedup
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (poll_id, user_id)  -- One vote per poll per user
);

-- ============================================================
-- INDEXES — For query performance
-- ============================================================
CREATE INDEX idx_posts_status        ON posts(status);
CREATE INDEX idx_posts_category      ON posts(category_id);
CREATE INDEX idx_posts_author        ON posts(author_id);
CREATE INDEX idx_posts_published_at  ON posts(published_at DESC);
CREATE INDEX idx_posts_is_featured   ON posts(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_posts_type          ON posts(post_type);
CREATE INDEX idx_posts_slug          ON posts(slug);

-- Full-text search index on body_text (Bengali content)
CREATE INDEX idx_posts_search ON posts USING GIN (to_tsvector('simple', COALESCE(title, '') || ' ' || COALESCE(body_text, '')));

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_likes_post    ON likes(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CALCULATE reading_time_min ON INSERT/UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_reading_time()
RETURNS TRIGGER AS $$
DECLARE
  word_count INTEGER;
BEGIN
  -- Average Bengali reading speed: ~150 words/minute
  word_count := array_length(string_to_array(COALESCE(NEW.body_text, ''), ' '), 1);
  NEW.reading_time_min := GREATEST(1, ROUND(word_count / 150.0));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_reading_time
  BEFORE INSERT OR UPDATE OF body_text ON posts
  FOR EACH ROW EXECUTE FUNCTION calculate_reading_time();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- This is what makes Supabase secure. Without RLS, anyone with
-- your anon key could read/write everything.
-- ============================================================
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags    ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls        ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes   ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only you can edit your own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: published posts are public; authors can CRUD their own; admins can do everything
CREATE POLICY "Published posts are public" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can view own drafts" ON posts FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Authors can insert posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- Categories & tags: public read, admin write only (enforced via service role in API)
CREATE POLICY "Categories are public" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "Tags are public" ON tags FOR SELECT USING (TRUE);
CREATE POLICY "Post tags are public" ON post_tags FOR SELECT USING (TRUE);

-- Likes: public read, authenticated write
CREATE POLICY "Likes are public" ON likes FOR SELECT USING (TRUE);
CREATE POLICY "Users can like posts" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: approved comments are public, users manage their own
CREATE POLICY "Approved comments are public" ON comments FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Polls: public read
CREATE POLICY "Polls are public" ON polls FOR SELECT USING (TRUE);
CREATE POLICY "Poll options are public" ON poll_options FOR SELECT USING (TRUE);
CREATE POLICY "Poll votes are public" ON poll_votes FOR SELECT USING (TRUE);
CREATE POLICY "Users can vote" ON poll_votes FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- SEED DATA — Default categories
-- ============================================================
INSERT INTO categories (name, slug, color, icon, sort_order) VALUES
  ('সাহিত্য',   'sahitya',    '#8e44ad', '📚', 1),
  ('রাজনীতি',  'rajneeti',   '#c0392b', '🏛️', 2),
  ('বিজ্ঞান',   'biggan',     '#2980b9', '🔬', 3),
  ('প্রযুক্তি', 'projukti',   '#16a085', '💻', 4),
  ('খেলাধুলা',  'kheladhula', '#27ae60', '⚽', 5),
  ('বিনোদন',   'binodon',    '#e67e22', '🎬', 6),
  ('ভ্রমণ',     'bhromon',    '#1abc9c', '✈️', 7),
  ('কবিতা',    'kobita',     '#9b59b6', '✍️', 8),
  ('গল্প',      'golpo',      '#e74c3c', '📖', 9),
  ('বই রিভিউ', 'boi-review', '#f39c12', '⭐', 10);
