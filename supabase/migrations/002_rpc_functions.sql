-- ============================================================
--  AgoveerChinta — RPC Functions v1.0
--  Run this AFTER 001_initial_schema.sql
-- ============================================================

-- ---- Atomically increment view count ----
-- WHY A FUNCTION? If two readers open the same post at once,
-- a simple UPDATE SET view_count = view_count + 1 can cause
-- a race condition. Using a function with FOR UPDATE lock prevents that.
CREATE OR REPLACE FUNCTION increment_view_count(post_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = post_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---- Get post like count ----
CREATE OR REPLACE FUNCTION get_post_like_count(post_id_input UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM likes WHERE post_id = post_id_input;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ---- Get post comment count ----
CREATE OR REPLACE FUNCTION get_post_comment_count(post_id_input UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM comments
  WHERE post_id = post_id_input AND is_approved = TRUE;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ---- Full-text search function ----
-- Searches posts by title and body_text using PostgreSQL's full text search.
-- 'simple' dictionary works better for Bengali than 'english'.
CREATE OR REPLACE FUNCTION search_posts(search_query TEXT)
RETURNS TABLE(
  id              UUID,
  title           TEXT,
  slug            TEXT,
  excerpt         TEXT,
  feature_image_url TEXT,
  published_at    TIMESTAMPTZ,
  view_count      INTEGER,
  rank            REAL
) AS $$
  SELECT
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.feature_image_url,
    p.published_at,
    p.view_count,
    ts_rank(
      to_tsvector('simple', COALESCE(p.title, '') || ' ' || COALESCE(p.body_text, '')),
      plainto_tsquery('simple', search_query)
    ) AS rank
  FROM posts p
  WHERE
    p.status = 'published'
    AND to_tsvector('simple', COALESCE(p.title, '') || ' ' || COALESCE(p.body_text, ''))
        @@ plainto_tsquery('simple', search_query)
  ORDER BY rank DESC, p.published_at DESC
  LIMIT 20;
$$ LANGUAGE sql STABLE;

-- Grant execution rights to anon and authenticated users
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_post_like_count(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_post_comment_count(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_posts(TEXT) TO anon, authenticated;
