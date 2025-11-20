-- Add language column to analysis_content table for language detection
-- This stores the detected language of the website content

ALTER TABLE analysis_content 
ADD COLUMN language text DEFAULT NULL;

-- Add comment to document the column
COMMENT ON COLUMN analysis_content.language IS 'Detected language of the website content (ISO 639-1 code like en, es, fr, etc.)';

-- Create index for filtering by language
CREATE INDEX IF NOT EXISTS idx_analysis_content_language ON analysis_content(language);
