-- Change Detection System
-- Stores snapshots of analyses and tracks changes over time

-- Table to store analysis snapshots (each scrape result)
-- This extends analysis_history with snapshot capabilities
CREATE TABLE IF NOT EXISTS analysis_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analysis_history(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  urls TEXT[], -- For multi-site comparisons
  result JSONB NOT NULL, -- Full InsightData
  purpose TEXT NOT NULL,
  domain TEXT,
  snapshot_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Change tracking metadata
  is_baseline BOOLEAN DEFAULT false, -- First snapshot to compare against
  previous_snapshot_id UUID REFERENCES analysis_snapshots(id) ON DELETE SET NULL,
  has_changes BOOLEAN DEFAULT false,
  change_magnitude TEXT CHECK (change_magnitude IN ('none', 'minor', 'moderate', 'major', 'critical')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_analysis_snapshots_user_id ON analysis_snapshots(user_id);
CREATE INDEX idx_analysis_snapshots_url ON analysis_snapshots(url);
CREATE INDEX idx_analysis_snapshots_analysis_id ON analysis_snapshots(analysis_id);
CREATE INDEX idx_analysis_snapshots_has_changes ON analysis_snapshots(has_changes);
CREATE INDEX idx_analysis_snapshots_created_at ON analysis_snapshots(created_at DESC);

-- Table to store detected changes
CREATE TABLE IF NOT EXISTS detected_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_id UUID NOT NULL REFERENCES analysis_snapshots(id) ON DELETE CASCADE,
  previous_snapshot_id UUID REFERENCES analysis_snapshots(id) ON DELETE SET NULL,
  
  -- Change details
  change_type TEXT NOT NULL, -- 'content', 'pricing', 'sentiment', 'structure', 'keyword', etc.
  field_path TEXT, -- JSON path to changed field (e.g., 'key_points[2]')
  old_value TEXT,
  new_value TEXT,
  change_description TEXT,
  
  -- Change classification
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  change_percentage NUMERIC(5,2), -- Percentage of change (0-100)
  
  -- Metadata
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false, -- User has seen this change
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_detected_changes_user_id ON detected_changes(user_id);
CREATE INDEX idx_detected_changes_snapshot_id ON detected_changes(snapshot_id);
CREATE INDEX idx_detected_changes_severity ON detected_changes(severity);
CREATE INDEX idx_detected_changes_acknowledged ON detected_changes(acknowledged);
CREATE INDEX idx_detected_changes_created_at ON detected_changes(created_at DESC);

-- Table for email notification queue and preferences
CREATE TABLE IF NOT EXISTS change_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_id UUID NOT NULL REFERENCES analysis_snapshots(id) ON DELETE CASCADE,
  
  -- Alert details
  alert_type TEXT CHECK (alert_type IN ('email', 'webhook', 'in_app')) DEFAULT 'email',
  recipient_email TEXT,
  subject TEXT,
  message TEXT,
  changes_summary JSONB, -- Summary of all changes
  
  -- Status tracking
  status TEXT CHECK (status IN ('pending', 'sent', 'failed', 'skipped')) DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_change_alerts_user_id ON change_alerts(user_id);
CREATE INDEX idx_change_alerts_status ON change_alerts(status);
CREATE INDEX idx_change_alerts_created_at ON change_alerts(created_at DESC);

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Email preferences
  email_enabled BOOLEAN DEFAULT true,
  email_address TEXT, -- Can override user's auth email
  
  -- Notification thresholds
  notify_on_minor BOOLEAN DEFAULT false,
  notify_on_moderate BOOLEAN DEFAULT true,
  notify_on_major BOOLEAN DEFAULT true,
  notify_on_critical BOOLEAN DEFAULT true,
  
  -- Frequency controls
  digest_frequency TEXT CHECK (digest_frequency IN ('instant', 'hourly', 'daily', 'weekly')) DEFAULT 'instant',
  quiet_hours_start TIME, -- e.g., '22:00:00'
  quiet_hours_end TIME,   -- e.g., '08:00:00'
  
  -- Filters
  specific_urls TEXT[], -- Only notify for these URLs
  excluded_urls TEXT[], -- Never notify for these URLs
  change_types TEXT[], -- Only notify for specific change types
  
  -- Metadata
  last_notification_sent TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE analysis_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analysis_snapshots
CREATE POLICY "Users can view their own snapshots"
  ON analysis_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snapshots"
  ON analysis_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snapshots"
  ON analysis_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snapshots"
  ON analysis_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for detected_changes
CREATE POLICY "Users can view their own changes"
  ON detected_changes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own changes"
  ON detected_changes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own changes"
  ON detected_changes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own changes"
  ON detected_changes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for change_alerts
CREATE POLICY "Users can view their own alerts"
  ON change_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
  ON change_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON change_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON change_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view their own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON notification_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id, email_address)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create preferences when user signs up
CREATE TRIGGER on_auth_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- Add change tracking columns to scheduled_tasks
ALTER TABLE scheduled_tasks 
ADD COLUMN IF NOT EXISTS last_change_detected TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS changes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_snapshot_id UUID REFERENCES analysis_snapshots(id) ON DELETE SET NULL;

-- Comment documentation
COMMENT ON TABLE analysis_snapshots IS 'Stores each analysis result as a snapshot for change tracking';
COMMENT ON TABLE detected_changes IS 'Records individual changes detected between snapshots';
COMMENT ON TABLE change_alerts IS 'Queue for sending notifications about detected changes';
COMMENT ON TABLE notification_preferences IS 'User preferences for change notifications';
