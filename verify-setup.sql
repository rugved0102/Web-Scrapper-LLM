-- Quick verification queries
-- Run in Supabase SQL Editor

-- 1. Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('analysis_snapshots', 'detected_changes', 'change_alerts', 'notification_preferences')
ORDER BY table_name;
