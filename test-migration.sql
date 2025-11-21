-- Verify Migration Applied Successfully
-- Run these in Supabase SQL Editor to check everything works

-- 1. Check all 4 tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('analysis_snapshots', 'detected_changes', 'change_alerts', 'notification_preferences');
-- Should return 4 rows

-- 2. Check tables are empty (ready to use)
SELECT 'analysis_snapshots' as table_name, COUNT(*) as count FROM analysis_snapshots
UNION ALL
SELECT 'detected_changes', COUNT(*) FROM detected_changes
UNION ALL
SELECT 'change_alerts', COUNT(*) FROM change_alerts
UNION ALL
SELECT 'notification_preferences', COUNT(*) FROM notification_preferences;
-- All should show 0

-- 3. Verify RLS policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('analysis_snapshots', 'detected_changes', 'change_alerts', 'notification_preferences')
ORDER BY tablename, policyname;
-- Should show 16 policies (4 per table)

-- 4. Check indexes were created
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('analysis_snapshots', 'detected_changes', 'change_alerts', 'notification_preferences')
ORDER BY indexname;
-- Should show multiple indexes

-- 5. Verify trigger exists
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_notification_prefs';
-- Should show 1 trigger

-- SUCCESS! If all queries return results, migration is complete ✅
