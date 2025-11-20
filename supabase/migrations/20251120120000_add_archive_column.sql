-- Add archive column to analysis_history
-- This extends the existing star/tags functionality

ALTER TABLE public.analysis_history 
ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;

-- Add index for archived items
CREATE INDEX IF NOT EXISTS idx_analysis_history_archived 
ON public.analysis_history(user_id, archived, created_at DESC);

-- Update comment
COMMENT ON COLUMN public.analysis_history.archived IS 'Whether this analysis has been archived by the user';
