# Scheduled Scraping Feature

## Overview
The Scheduled Scraping feature allows users to set up recurring website analyses that run automatically at specified intervals (daily, weekly, or monthly).

## Implementation Status
✅ **Code Complete** - All components, edge functions, and UI integrated
⚠️ **Database Setup Required** - Migration needs manual application

## Components

### 1. Database Table: `scheduled_tasks`
Located in: `supabase/migrations/20251120134640_add_scheduled_tasks_only.sql`

**Schema:**
```sql
- id: uuid (Primary Key)
- user_id: uuid (Foreign Key to auth.users)
- urls: text[] (Array of URLs to analyze)
- purpose: text (Analysis purpose)
- domain: text (Domain type for specialized analysis)
- frequency: text (daily|weekly|monthly)
- next_run: timestamptz (Next scheduled execution time)
- enabled: boolean (Whether schedule is active)
- created_at: timestamptz
- updated_at: timestamptz
```

**Features:**
- Row Level Security (RLS) policies for user isolation
- Automatic `updated_at` timestamp via trigger
- Indexes for efficient querying by user_id, next_run, and enabled status

### 2. ScheduleConfig Component
Located in: `src/components/InsightEngine/ScheduleConfig.tsx`

**Features:**
- Frequency selector (daily/weekly/monthly)
- Calendar date picker for first run date
- Enable/disable toggle
- Visual info box showing schedule details
- Form validation
- Toast notifications for success/error

**Usage:**
```tsx
<ScheduleConfig
  urls={["https://example.com"]}
  purpose="business"
  domain="general"
/>
```

### 3. Scheduled Scraper Edge Function
Located in: `supabase/functions/scheduled-scraper/index.ts`

**Functionality:**
- Queries `scheduled_tasks` for tasks due to run
- Calls `analyze-websites` function for each task
- Calculates next run time based on frequency:
  - Daily: +24 hours
  - Weekly: +7 days
  - Monthly: +1 month
- Updates `next_run` timestamp in database
- Returns processing results

**Endpoint:**
```
POST /functions/v1/scheduled-scraper
```

### 4. UI Integration

**Index.tsx:**
- "Schedule Recurring" button appears after analysis completes
- Toggle shows/hides ScheduleConfig component
- Tracks last analyzed URLs for easy scheduling

**HistorySidebar.tsx:**
- Displays upcoming scheduled tasks at top
- Shows frequency badge and next run time
- Real-time updates via Supabase subscriptions
- Compact card layout with clock icon

## Setup Instructions

### Step 1: Apply Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/cciipditpzuukrezoyfw
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/20251120134640_add_scheduled_tasks_only.sql`
5. Click **Run** to execute the migration

### Step 2: Set Up Automated Execution (Optional)

To automatically run scheduled tasks, you need to set up pg_cron:

**Option A: Using Supabase (Requires Pro Plan)**
1. Enable pg_cron extension in Supabase Dashboard
2. Create a cron job:
```sql
SELECT cron.schedule(
  'run-scheduled-scraper',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url := 'YOUR_SUPABASE_URL/functions/v1/scheduled-scraper',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

**Option B: External Cron Service**
Use services like:
- GitHub Actions (free, runs every 5-15 minutes)
- Vercel Cron Jobs
- AWS EventBridge
- Any cron service that can call HTTP endpoints

Example GitHub Action (`.github/workflows/scheduled-scraper.yml`):
```yaml
name: Run Scheduled Scraper

on:
  schedule:
    - cron: '*/15 * * * *' # Every 15 minutes

jobs:
  run-scraper:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger scheduled scraper
        run: |
          curl -X POST "YOUR_SUPABASE_URL/functions/v1/scheduled-scraper" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}"
```

### Step 3: Deploy Edge Function

```bash
supabase functions deploy scheduled-scraper --no-verify-jwt
```

## Usage Guide

### Creating a Schedule

1. Run an analysis on one or more URLs
2. After results appear, click **"Schedule Recurring"** button
3. Select frequency (daily/weekly/monthly)
4. Pick the first run date using the calendar
5. Toggle enable/disable as needed
6. Click **"Create Schedule"**

### Viewing Scheduled Tasks

- Scheduled tasks appear at the top of the HistorySidebar
- Shows frequency badge and next run time
- Limited to 3 most recent tasks in sidebar

### Managing Schedules

Currently, schedules can be managed via:
- Supabase Dashboard > Table Editor > scheduled_tasks
- Future enhancement: Add UI for editing/deleting schedules

## Technical Details

### Frequency Calculation

**Daily:**
```typescript
newNextRun = new Date(currentNextRun.getTime() + 24 * 60 * 60 * 1000);
```

**Weekly:**
```typescript
newNextRun = new Date(currentNextRun.getTime() + 7 * 24 * 60 * 60 * 1000);
```

**Monthly:**
```typescript
newNextRun = new Date(currentNextRun);
newNextRun.setMonth(newNextRun.getMonth() + 1);
```

### Security

- Row Level Security ensures users can only see their own schedules
- Service role key required for scheduled-scraper function
- JWT verification disabled for scheduled-scraper (cron calls)

### Error Handling

- Failed analyses are logged but don't stop other tasks
- Next run time is still updated even if analysis fails
- Toast notifications for user-facing errors

## Future Enhancements

1. **Schedule Management UI**
   - Edit existing schedules
   - Delete/pause schedules
   - View schedule history

2. **Email Notifications**
   - Send email when scheduled analysis completes
   - Alert on analysis failures
   - Weekly digest of scheduled analyses

3. **Advanced Scheduling**
   - Custom cron expressions
   - Specific time of day selection
   - Timezone support

4. **Schedule Templates**
   - Save schedule configurations
   - Quick setup for common patterns

## Troubleshooting

**Issue: Schedules not running automatically**
- Solution: Set up pg_cron or external cron service (see Step 2 above)

**Issue: Can't create schedule**
- Check: Database migration applied successfully
- Check: User is authenticated
- Check: URLs array is not empty

**Issue: Scheduled tasks not appearing in sidebar**
- Check: Tasks are enabled in database
- Check: Real-time subscription is active
- Refresh the page to force fetch

## Files Modified

1. `supabase/migrations/20251120134640_add_scheduled_tasks_only.sql` - Database schema
2. `src/components/InsightEngine/ScheduleConfig.tsx` - Schedule UI component
3. `supabase/functions/scheduled-scraper/index.ts` - Edge function for processing
4. `src/pages/Index.tsx` - Integration of ScheduleConfig
5. `src/components/HistorySidebar.tsx` - Display of scheduled tasks
6. `package.json` - Added date-fns dependency

## Commit
- Hash: 3d7ef68
- Message: "feat: implement scheduled scraping (Task 6)"
