-- Migration: Add enhanced fields to analysis_history
-- This adds new features without breaking existing functionality

-- Add new columns for better tracking (all nullable or with defaults to preserve existing data)
ALTER TABLE public.analysis_history 
ADD COLUMN IF NOT EXISTS urls text[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS title text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS starred boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Migrate existing single url to urls array (only if urls is null)
UPDATE public.analysis_history 
SET urls = ARRAY[url] 
WHERE urls IS NULL AND url IS NOT NULL;

-- Make urls array not null now that we've migrated
ALTER TABLE public.analysis_history 
ALTER COLUMN urls SET NOT NULL,
ALTER COLUMN urls SET DEFAULT '{}';

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_analysis_history_updated_at ON public.analysis_history;
CREATE TRIGGER update_analysis_history_updated_at 
BEFORE UPDATE ON public.analysis_history 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_analysis_history_starred 
ON public.analysis_history(user_id, starred, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_history_tags 
ON public.analysis_history USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_analysis_history_purpose 
ON public.analysis_history(user_id, purpose, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_history_updated_at 
ON public.analysis_history(user_id, updated_at DESC);

-- Add RLS policy for updates (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'analysis_history' 
        AND policyname = 'Users can update their own history'
    ) THEN
        CREATE POLICY "Users can update their own history"
        ON public.analysis_history
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Create view for user analytics
CREATE OR REPLACE VIEW user_analysis_stats AS
SELECT 
  user_id,
  COUNT(*) as total_analyses,
  COUNT(DISTINCT purpose) as purposes_used,
  COUNT(*) FILTER (WHERE starred = true) as starred_count,
  MIN(created_at) as first_analysis,
  MAX(created_at) as last_analysis
FROM public.analysis_history
GROUP BY user_id;

-- Grant access to view
GRANT SELECT ON user_analysis_stats TO authenticated;

-- Add helpful comment
COMMENT ON TABLE public.analysis_history IS 'Stores analysis history with enhanced features: starring, tagging, multiple URLs support';
