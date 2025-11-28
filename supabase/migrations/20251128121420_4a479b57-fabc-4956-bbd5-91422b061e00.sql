-- Add AI reflection threads to moments
ALTER TABLE moments ADD COLUMN IF NOT EXISTS ai_reflections jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN moments.ai_reflections IS 'Array of AI reflection threads: [{id, ai_text, user_reply, timestamp}]';