-- Add domain column to analysis_history table for domain template tracking
-- This allows users to track which domain template was used for each analysis

ALTER TABLE analysis_history 
ADD COLUMN domain text DEFAULT 'general';

-- Add comment to document the column
COMMENT ON COLUMN analysis_history.domain IS 'Website type/domain template used for analysis (ecommerce, news, research, jobs, realestate, socialmedia, documentation, general)';

-- Create index for filtering by domain
CREATE INDEX IF NOT EXISTS idx_analysis_history_domain ON analysis_history(domain);
