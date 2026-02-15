-- Phase 6: Calendar, Stats, Year in Review
-- ==========================================

-- Index for calendar date aggregation (range scans on created_at per user)
CREATE INDEX IF NOT EXISTS idx_memories_user_created_date
  ON memories (user_id, created_at);

-- Calendar: get days with memory counts for a month
CREATE OR REPLACE FUNCTION get_calendar_days(p_user_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE(day DATE, count BIGINT) LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT (created_at AT TIME ZONE 'UTC')::date AS day, COUNT(*) AS count
  FROM memories WHERE user_id = p_user_id AND created_at >= p_start_date AND created_at < p_end_date
  GROUP BY day ORDER BY day;
$$;

-- Stats: calculate current + longest capture streaks
CREATE OR REPLACE FUNCTION get_user_streaks(p_user_id UUID)
RETURNS TABLE(current_streak INT, longest_streak INT) LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  v_current INT := 0;
  v_longest INT := 0;
  v_streak INT := 0;
  v_prev_date DATE := NULL;
  v_rec RECORD;
BEGIN
  FOR v_rec IN
    SELECT DISTINCT (created_at AT TIME ZONE 'UTC')::date AS d
    FROM memories WHERE user_id = p_user_id
    ORDER BY d DESC
  LOOP
    IF v_prev_date IS NULL THEN
      -- First date
      v_streak := 1;
    ELSIF v_prev_date - v_rec.d = 1 THEN
      -- Consecutive day
      v_streak := v_streak + 1;
    ELSE
      -- Gap found
      IF v_current = 0 THEN
        v_current := v_streak;
      END IF;
      IF v_streak > v_longest THEN
        v_longest := v_streak;
      END IF;
      v_streak := 1;
    END IF;
    v_prev_date := v_rec.d;
  END LOOP;

  -- Handle the last streak
  IF v_current = 0 THEN
    v_current := v_streak;
  END IF;
  IF v_streak > v_longest THEN
    v_longest := v_streak;
  END IF;

  -- Check if current streak is still active (includes today or yesterday)
  IF v_prev_date IS NOT NULL THEN
    DECLARE
      v_first_date DATE;
    BEGIN
      SELECT DISTINCT (created_at AT TIME ZONE 'UTC')::date INTO v_first_date
      FROM memories WHERE user_id = p_user_id
      ORDER BY 1 DESC LIMIT 1;

      IF v_first_date < (CURRENT_DATE - INTERVAL '1 day')::date THEN
        v_current := 0;
      END IF;
    END;
  END IF;

  RETURN QUERY SELECT v_current, v_longest;
END;
$$;

-- Review: get distinct years that have memories
CREATE OR REPLACE FUNCTION get_memory_years(p_user_id UUID)
RETURNS TABLE(year INT) LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT DISTINCT EXTRACT(YEAR FROM created_at)::INT AS year
  FROM memories WHERE user_id = p_user_id ORDER BY year DESC;
$$;

-- Review: top tags for a year
CREATE OR REPLACE FUNCTION get_top_tags_for_year(p_user_id UUID, p_year INT)
RETURNS TABLE(name TEXT, count BIGINT) LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT t.name, COUNT(*) AS count
  FROM memory_tags mt JOIN tags t ON t.id = mt.tag_id JOIN memories m ON m.id = mt.memory_id
  WHERE m.user_id = p_user_id AND EXTRACT(YEAR FROM m.created_at) = p_year
  GROUP BY t.name ORDER BY count DESC LIMIT 10;
$$;

-- Phase 7: AI Semantic Search + Tag Discovery
-- =============================================

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column (text-embedding-3-small = 1536 dimensions)
ALTER TABLE memories ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- HNSW index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS idx_memories_embedding
  ON memories USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Semantic search RPC
CREATE OR REPLACE FUNCTION match_memories(
  p_user_id UUID, p_embedding vector(1536),
  p_match_threshold FLOAT DEFAULT 0.3, p_match_count INT DEFAULT 20
) RETURNS TABLE(id UUID, content TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, similarity FLOAT)
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT m.id, m.content, m.created_at, m.updated_at,
         1 - (m.embedding <=> p_embedding) AS similarity
  FROM memories m
  WHERE m.user_id = p_user_id AND m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> p_embedding) > p_match_threshold
  ORDER BY m.embedding <=> p_embedding LIMIT p_match_count;
$$;

-- Backfill progress helper
CREATE OR REPLACE FUNCTION count_unembedded_memories(p_user_id UUID)
RETURNS BIGINT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COUNT(*) FROM memories WHERE user_id = p_user_id AND embedding IS NULL;
$$;
