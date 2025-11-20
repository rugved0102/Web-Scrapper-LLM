-- Add comparison column to analysis_history table for multi-site comparison insights
-- This stores structured comparison data when multiple URLs are analyzed together

ALTER TABLE analysis_history 
ADD COLUMN comparison jsonb DEFAULT NULL;

-- Add comment to document the column
COMMENT ON COLUMN analysis_history.comparison IS 'Multi-site comparison insights including per-site strengths/weaknesses, differences, and similarities (only populated when analyzing 2+ URLs)';

-- Create GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_analysis_history_comparison ON analysis_history USING GIN(comparison);
