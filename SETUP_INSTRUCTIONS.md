# Setup Instructions for Change Detection System

## Step 1: Apply Database Migration

Since the remote database already has the initial tables, we need to apply the migration manually through Supabase Dashboard.

### Instructions:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/cciipditpzuukrezoyfw
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase/migrations/20251120000000_change_detection_system.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute

The migration creates:
- `analysis_snapshots` table
- `detected_changes` table
- `change_alerts` table  
- `notification_preferences` table
- All necessary indexes and RLS policies

## Step 2: Configure Resend API Key

### Get Resend API Key:

1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Verify your domain OR use Resend's test domain (onboarding@resend.dev)
3. Go to **API Keys** tab
4. Create a new API key
5. Copy the key (starts with `re_`)

### Add to Supabase:

1. In Supabase Dashboard, go to **Project Settings** → **Edge Functions**
2. Scroll to **Secrets** section
3. Add new secret:
   - Name: `RESEND_API_KEY`
   - Value: `re_your_api_key_here`
4. Click **Save**

### Update Email From Address:

Edit `supabase/functions/send-change-alerts/index.ts` line 66:
```typescript
from: "Web Scraper <notifications@yourdomain.com>" // Change to your verified domain
```

Or use Resend's onboarding email:
```typescript
from: "Web Scraper <onboarding@resend.dev>"
```

## Step 3: Deploy Edge Functions

Run these commands to deploy the new edge function:

```powershell
# Deploy send-change-alerts function
supabase functions deploy send-change-alerts

# Verify deployment
supabase functions list
```

## Step 4: Set Up Cron Job for Email Alerts

### Option A: GitHub Actions (Recommended)

Create `.github/workflows/send-alerts.yml`:

```yaml
name: Send Change Alerts
on:
  schedule:
    - cron: '*/5 * * * *' # Every 5 minutes
  workflow_dispatch: # Allow manual trigger

jobs:
  send-alerts:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger alert function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            https://cciipditpzuukrezoyfw.supabase.co/functions/v1/send-change-alerts
```

Then add secret to GitHub:
1. Go to your repo settings → Secrets and variables → Actions
2. Add new secret: `SUPABASE_SERVICE_ROLE_KEY`
3. Value: Copy from `.env.local` file

### Option B: EasyCron (No GitHub needed)

1. Sign up at https://www.easycron.com (free tier)
2. Create new cron job:
   - URL: `https://cciipditpzuukrezoyfw.supabase.co/functions/v1/send-change-alerts`
   - Cron expression: `*/5 * * * *` (every 5 minutes)
   - HTTP Method: POST
   - HTTP Headers: 
     ```
     Authorization: Bearer YOUR_SERVICE_ROLE_KEY
     ```

### Option C: Supabase pg_cron (Pro Plan Only)

If you have Supabase Pro, run this in SQL Editor:

```sql
SELECT cron.schedule(
  'send-change-alerts',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://cciipditpzuukrezoyfw.supabase.co/functions/v1/send-change-alerts',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

## Step 5: Regenerate Supabase Types

Run this command to update TypeScript types:

```powershell
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

This will add types for the 4 new tables, allowing you to remove `(supabase as any)` type assertions.

## Verification Steps

### Test Change Detection:

1. Create a baseline analysis
2. Wait or modify content
3. Create another analysis of same URL
4. Check `analysis_snapshots` table - should see 2 entries
5. Check `detected_changes` table - should see changes
6. Check `change_alerts` table - should see pending alert

### Test Email Sending:

1. In NotificationSettings component, enable email notifications
2. Click "Send Test Email"
3. Check your email inbox
4. Or manually trigger: 
   ```powershell
   curl -X POST `
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" `
     https://cciipditpzuukrezoyfw.supabase.co/functions/v1/send-change-alerts
   ```

### Monitor Alerts:

Run this query in SQL Editor to check alert status:

```sql
SELECT 
  status, 
  COUNT(*) 
FROM change_alerts 
GROUP BY status;
```

## Troubleshooting

### Emails not sending:
- Check RESEND_API_KEY is set correctly
- Verify email domain is verified in Resend (or use onboarding@resend.dev)
- Check `change_alerts` table for error_message
- Check Edge Function logs in Supabase Dashboard

### Changes not detected:
- Verify migration was applied (check if tables exist)
- Check analyze-websites function has integration code
- Review `analysis_snapshots` table for entries
- Check browser console for errors

### Type errors after regenerating:
- Clear TypeScript cache: `rm -r node_modules/.vite`
- Restart dev server: `npm run dev`
- Check all imports are correct

## Next Steps

After completing setup:

1. Test full flow with a scheduled scrape
2. Monitor email delivery rates
3. Adjust notification thresholds based on user feedback
4. Consider adding Slack/Discord webhooks
5. Set up monitoring dashboards

---

For detailed implementation guide, see `docs/CHANGE_DETECTION_IMPLEMENTATION.md`
