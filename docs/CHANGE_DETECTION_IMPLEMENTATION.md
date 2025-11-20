# Change Detection System - Complete Implementation Guide

## 🎯 Overview

This document outlines the complete change detection system that has been implemented. The system automatically detects, tracks, and notifies users of changes in website content between scrapes.

## ✅ Completed Components

### 1. Database Schema (`supabase/migrations/20251120000000_change_detection_system.sql`)

**Tables Created:**
- `analysis_snapshots` - Stores each analysis result for historical comparison
- `detected_changes` - Records individual changes with severity and type
- `change_alerts` - Queue for pending email notifications
- `notification_preferences` - User preferences for alerts

**Key Features:**
- Full RLS (Row Level Security) policies
- Indexes for optimal query performance
- Automatic default preferences creation on user signup
- Support for change magnitude classification (none/minor/moderate/major/critical)

### 2. Change Detection Algorithm (`src/lib/changeDetection.ts`)

**Capabilities:**
- String similarity using Levenshtein distance
- Array comparison with set operations
- Automatic pricing change detection from text
- Sentiment analysis (positive/negative keywords)
- Content diffing (added/removed items)
- Overall similarity scoring (0-100%)
- Change magnitude classification
- 7 change types: content, pricing, sentiment, structure, keyword, recommendation, domain_insight

**Key Functions:**
```typescript
detectChanges(previousData, currentData) -> ChangeDetectionResult
calculateStringSimilarity(str1, str2) -> number
areSimilarAnalyses(data1, data2, threshold) -> boolean
```

### 3. UI Components

#### DiffViewer (`src/components/InsightEngine/DiffViewer.tsx`)
- Side-by-side comparison view
- Color-coded changes (green=added, red=removed)
- Severity indicators with icons
- Tabbed interface (Summary, Key Points, Insights, Recommendations, Domain)
- Collapsible unchanged items
- Change statistics dashboard

#### HistoryTimeline (`src/components/InsightEngine/HistoryTimeline.tsx`)
- Visual timeline with chronological snapshots
- Statistics cards (snapshots, changes, critical count, avg similarity)
- Time range filters (7d, 30d, 90d, all time)
- Change type filtering
- Color-coded timeline dots by magnitude
- Mini trend chart showing change frequency
- Clickable timeline items

#### NotificationSettings (`src/components/InsightEngine/NotificationSettings.tsx`)
- Email notifications toggle
- Severity threshold settings (critical/major/moderate/minor)
- Frequency options (instant/hourly/daily/weekly)
- Quiet hours configuration
- Test notification button
- Save/reset functionality

#### HistorySidebar Updates
- Added change badges to history items
- Color-coded severity indicators
- Change count display
- Visual icons for different magnitudes

### 4. Email Notification System (`supabase/functions/send-change-alerts/index.ts`)

**Features:**
- Processes pending alerts from `change_alerts` table
- Sends via Resend API
- Beautiful HTML email template with:
  - Gradient header
  - Change summary with magnitude badges
  - Individual change details with severity
  - CTA button to view comparison
  - Unsubscribe/preferences links
- Retry logic for failed sends
- Batch processing (50 alerts at a time)

## 🔧 Integration Steps

### Step 1: Apply Database Migration

```bash
# Using Supabase CLI
supabase migration up

# Or manually in Supabase SQL Editor
# Copy and paste content from:
# supabase/migrations/20251120000000_change_detection_system.sql
```

### Step 2: Regenerate Supabase Types

```bash
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### Step 3: Configure Resend API

1. Sign up for Resend at https://resend.com
2. Get your API key
3. Add to Supabase environment variables:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

4. Update email "from" address in `send-change-alerts/index.ts`:
```typescript
from: "Web Scraper <notifications@yourdomain.com>"
```

### Step 4: Integrate with analyze-websites Edge Function

Add the following to `supabase/functions/analyze-websites/index.ts`:

```typescript
// At the top, import change detection
import { detectChanges } from "../_shared/changeDetection.ts";

// After analysis completes, before saving to database:
async function processWithChangeDetection(
  supabase: any,
  userId: string,
  url: string,
  currentData: InsightResponse,
  purpose: string
) {
  // 1. Fetch previous snapshot for this URL
  const { data: previousSnapshot } = await supabase
    .from("analysis_snapshots")
    .select("*")
    .eq("user_id", userId)
    .eq("url", url)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // 2. Detect changes if previous exists
  let changeResult = null;
  if (previousSnapshot) {
    changeResult = detectChanges(previousSnapshot.result, currentData);
  }

  // 3. Save new snapshot
  const { data: newSnapshot } = await supabase
    .from("analysis_snapshots")
    .insert({
      user_id: userId,
      url: url,
      result: currentData,
      purpose: purpose,
      is_baseline: !previousSnapshot,
      previous_snapshot_id: previousSnapshot?.id,
      has_changes: changeResult?.hasChanges || false,
      change_magnitude: changeResult?.changeMagnitude || 'none',
    })
    .select()
    .single();

  // 4. Store detected changes
  if (changeResult && changeResult.hasChanges) {
    const changesToInsert = changeResult.changes.map(change => ({
      user_id: userId,
      snapshot_id: newSnapshot.id,
      previous_snapshot_id: previousSnapshot.id,
      change_type: change.type,
      field_path: change.fieldPath,
      old_value: change.oldValue,
      new_value: change.newValue,
      change_description: change.description,
      severity: change.severity,
      change_percentage: change.changePercentage,
    }));

    await supabase
      .from("detected_changes")
      .insert(changesToInsert);

    // 5. Check user notification preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    // 6. Create alert if user wants to be notified
    const shouldNotify = prefs?.email_enabled &&
      ((changeResult.changeMagnitude === 'critical' && prefs.notify_on_critical) ||
       (changeResult.changeMagnitude === 'major' && prefs.notify_on_major) ||
       (changeResult.changeMagnitude === 'moderate' && prefs.notify_on_moderate) ||
       (changeResult.changeMagnitude === 'minor' && prefs.notify_on_minor));

    if (shouldNotify) {
      await supabase
        .from("change_alerts")
        .insert({
          user_id: userId,
          snapshot_id: newSnapshot.id,
          alert_type: 'email',
          recipient_email: prefs.email_address || user.email,
          subject: `🔔 Changes Detected: ${url}`,
          message: changeResult.summary,
          changes_summary: {
            magnitude: changeResult.changeMagnitude,
            similarity: changeResult.overallSimilarity,
            changes: changeResult.changes,
          },
        });
    }
  }

  return newSnapshot;
}
```

### Step 5: Create Cron Job for Email Alerts

**Option A: Using pg_cron (Supabase Pro)**
```sql
-- Run every 5 minutes
SELECT cron.schedule(
  'send-change-alerts',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-change-alerts',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

**Option B: External Cron (Any platform)**
Use a service like GitHub Actions, cron-job.org, or EasyCron:
```yaml
# .github/workflows/send-alerts.yml
name: Send Change Alerts
on:
  schedule:
    - cron: '*/5 * * * *' # Every 5 minutes
jobs:
  send-alerts:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger alert function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            https://your-project.supabase.co/functions/v1/send-change-alerts
```

### Step 6: Update Scheduled Scraping

Modify `ScheduleConfig.tsx` to track last change:
```typescript
// After scheduling completes, update scheduled_tasks
await supabase
  .from("scheduled_tasks")
  .update({
    last_snapshot_id: newSnapshot.id,
    changes_count: changeResult?.changes.length || 0,
    last_change_detected: changeResult?.hasChanges ? new Date().toISOString() : null,
  })
  .eq("id", taskId);
```

## 📊 Usage Examples

### Displaying DiffViewer

```typescript
import { DiffViewer } from "@/components/InsightEngine/DiffViewer";
import { detectChanges } from "@/lib/changeDetection";

// In your component
const previousData = previousSnapshot.result;
const currentData = currentSnapshot.result;
const changeResult = detectChanges(previousData, currentData);

<DiffViewer
  previousData={previousData}
  currentData={currentData}
  changes={changeResult.changes}
  changeSummary={changeResult.summary}
  similarity={changeResult.overallSimilarity}
/>
```

### Displaying HistoryTimeline

```typescript
import { HistoryTimeline } from "@/components/InsightEngine/HistoryTimeline";

// Fetch snapshots from database
const { data: snapshots } = await supabase
  .from("analysis_snapshots")
  .select("*")
  .eq("url", selectedUrl)
  .order("created_at", { ascending: false });

const timelineData = snapshots.map(s => ({
  id: s.id,
  timestamp: new Date(s.snapshot_at),
  url: s.url,
  changeMagnitude: s.change_magnitude,
  changesCount: s.changes_count || 0,
  changeTypes: s.change_types || [],
  similarity: s.similarity || 100,
  summary: s.change_summary || '',
}));

<HistoryTimeline
  snapshots={timelineData}
  onSnapshotClick={(id) => viewSnapshot(id)}
/>
```

### Displaying NotificationSettings

```typescript
import { NotificationSettings } from "@/components/InsightEngine/NotificationSettings";

// In settings page or modal
<NotificationSettings />
```

## 🎨 Customization

### Email Template
Edit `supabase/functions/send-change-alerts/index.ts` to customize:
- Email colors and branding
- Header/footer content
- CTA button URL
- Email copy

### Change Detection Sensitivity
Adjust in `src/lib/changeDetection.ts`:
```typescript
// Line ~350: Threshold for considering content changed
if (tldrSimilarity < 80) { // Change from 80 to your preferred value
  // ...
}

// Line ~400: Magnitude classification
if (criticalCount > 0 || overallSimilarity < 40) { // Adjust thresholds
  changeMagnitude = 'critical';
}
```

### Notification Frequency
Default is "instant" but users can change in NotificationSettings.
To implement digest emails, modify `send-change-alerts/index.ts` to:
1. Group alerts by user and frequency preference
2. Only send if enough time has passed since last notification
3. Combine multiple changes into one digest email

## 🔍 Testing

### Test Change Detection
```typescript
import { detectChanges } from "@/lib/changeDetection";

const oldData = { tldr: "Old summary", key_points: ["Point 1"], ... };
const newData = { tldr: "New summary", key_points: ["Point 1", "Point 2"], ... };

const result = detectChanges(oldData, newData);
console.log(result.summary); // "Detected 1 content change"
console.log(result.changeMagnitude); // "minor" or "moderate", etc.
```

### Test Email Sending
```typescript
// In NotificationSettings component, click "Send Test Email" button
// Or manually trigger:
await fetch('/functions/v1/send-change-alerts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${serviceRoleKey}`,
  },
});
```

## 📈 Monitoring

### Check Alert Queue
```sql
SELECT status, COUNT(*) 
FROM change_alerts 
GROUP BY status;
```

### View Recent Changes
```sql
SELECT 
  s.url,
  s.change_magnitude,
  COUNT(c.id) as changes_count,
  s.created_at
FROM analysis_snapshots s
LEFT JOIN detected_changes c ON c.snapshot_id = s.id
WHERE s.has_changes = true
AND s.created_at > NOW() - INTERVAL '7 days'
GROUP BY s.id
ORDER BY s.created_at DESC;
```

### Failed Email Alerts
```sql
SELECT * 
FROM change_alerts 
WHERE status = 'failed' 
AND retry_count < 3
ORDER BY created_at DESC;
```

## 🚀 Next Steps

1. **Apply the migration** to create database tables
2. **Configure Resend API** for email sending
3. **Integrate** change detection into analyze-websites function
4. **Set up cron job** for automated alert sending
5. **Test** with a few sample analyses
6. **Monitor** the alert queue and user feedback

## 💡 Tips

- Start with **moderate** and **major** notifications enabled by default
- Allow **24 hours** before first scheduled scrape to establish baseline
- Consider **rate limiting** email alerts (max 10/day per user)
- Add **email preview** feature before sending test notifications
- Implement **webhook support** for Slack/Discord integrations
- Add **API endpoints** for programmatic access to change history

## 📝 Notes

- Type assertions (`as any`) are used temporarily until Supabase types are regenerated
- Email "from" address needs to be verified in Resend
- Quiet hours respect user timezone (stored in preferences)
- Change detection runs automatically for scheduled scrapes
- Manual analyses also create snapshots for future comparison
