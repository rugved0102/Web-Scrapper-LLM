# 🚀 Quick Start - Manual Steps Required

All code changes are complete! Here are the **5 manual steps** you need to complete to activate the change detection system:

## ✅ What's Already Done

- ✅ Database schema created (4 new tables)
- ✅ Change detection algorithm implemented
- ✅ UI components ready (Timeline, DiffViewer, Settings, Sidebar badges)
- ✅ Email notification system implemented
- ✅ Integration with analyze-websites function
- ✅ GitHub Actions workflow created
- ✅ TypeScript types regenerated
- ✅ Documentation written

## 📋 5 Steps You Need to Do

### Step 1: Apply Database Migration (2 minutes)

1. Go to https://supabase.com/dashboard/project/cciipditpzuukrezoyfw
2. Click **SQL Editor** in left sidebar
3. Click **+ New Query**
4. Open `supabase/migrations/20251120000000_change_detection_system.sql`
5. Copy ALL contents and paste into SQL Editor
6. Click **RUN** button
7. Verify success message appears

**Verify:** Run this query to check tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('analysis_snapshots', 'detected_changes', 'change_alerts', 'notification_preferences');
```
Should return 4 rows.

---

### Step 2: Get Resend API Key (3 minutes)

1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Click **API Keys** in left menu
3. Click **Create API Key**
4. Give it a name: "Web Scraper Alerts"
5. Copy the key (starts with `re_`)

---

### Step 3: Configure Supabase Environment (2 minutes)

1. In Supabase Dashboard, go to **Project Settings** (bottom left)
2. Click **Edge Functions** tab
3. Scroll to **Secrets** section
4. Click **Add new secret**
5. Name: `RESEND_API_KEY`
6. Value: Paste your Resend API key from Step 2
7. Click **Save**

**Verify:** The secret should appear in the list (value will be hidden)

---

### Step 4: Deploy Edge Function (1 minute)

Run this command in your terminal:

```powershell
cd c:\Users\user\Downloads\web-scrapper-llm
supabase functions deploy send-change-alerts
```

**Verify:** Should see "Deployed successfully" message

---

### Step 5: Add GitHub Secret (2 minutes)

1. Go to your GitHub repo: https://github.com/rugved0102/Web-Scrapper-LLM
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `SUPABASE_SERVICE_ROLE_KEY`
6. Value: Copy from `.env.local` file (line with `SUPABASE_SERVICE_ROLE_KEY=`)
7. Click **Add secret**

**Verify:** The workflow file is already committed at `.github/workflows/send-alerts.yml`

---

## 🧪 Test It Works

### Test 1: Check Migration Applied

```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM analysis_snapshots;
SELECT COUNT(*) FROM detected_changes;
SELECT COUNT(*) FROM change_alerts;
SELECT COUNT(*) FROM notification_preferences;
```
All should return 0 (tables exist but empty).

### Test 2: Create Analysis

1. Open your web app
2. Run an analysis on any URL
3. Wait for completion
4. Check database:
```sql
SELECT * FROM analysis_snapshots ORDER BY created_at DESC LIMIT 1;
```
Should see 1 row with `is_baseline = true`

### Test 3: Detect Changes

1. Run analysis on SAME URL again
2. Check for changes:
```sql
SELECT * FROM detected_changes ORDER BY created_at DESC LIMIT 5;
SELECT * FROM change_alerts WHERE status = 'pending' LIMIT 5;
```

### Test 4: Email Alerts

1. Go to NotificationSettings in your app
2. Enable email notifications
3. Set thresholds (e.g., notify on Major changes)
4. Click "Send Test Email"
5. Check your inbox

### Test 5: Cron Job (after 5 minutes)

1. Wait 5 minutes after creating an alert
2. Check GitHub Actions tab in your repo
3. Should see "Send Change Alerts" workflow running
4. Check database:
```sql
SELECT * FROM change_alerts WHERE status = 'sent' LIMIT 5;
```

---

## 📊 Monitor System

### Dashboard Queries

**Alert Status:**
```sql
SELECT status, COUNT(*) 
FROM change_alerts 
GROUP BY status;
```

**Recent Changes:**
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
ORDER BY s.created_at DESC
LIMIT 10;
```

**Failed Alerts:**
```sql
SELECT * 
FROM change_alerts 
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎯 Optional: Email Domain Configuration

By default, emails come from Resend's test domain. To use your own domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add DNS records (Resend provides them)
5. Wait for verification (usually <10 minutes)
6. Update `supabase/functions/send-change-alerts/index.ts` line 66:
   ```typescript
   from: "Web Scraper <notifications@yourdomain.com>"
   ```
7. Redeploy: `supabase functions deploy send-change-alerts`

---

## 🔧 Troubleshooting

### Migration Failed
- Make sure you copied the ENTIRE migration file
- Check for existing tables (may need to drop and recreate)
- Look for error messages in SQL Editor

### Emails Not Sending
- Verify RESEND_API_KEY is set correctly in Supabase
- Check Edge Function logs in Supabase Dashboard
- Verify email address in notification_preferences table
- Check Resend dashboard for delivery logs

### Changes Not Detected
- Verify migration was applied (tables exist)
- Check analyze-websites function logs
- Make sure you're analyzing the SAME URL twice
- Content needs to actually change between analyses

### Cron Job Not Running
- Verify GitHub secret is added
- Check Actions tab in GitHub for workflow runs
- Try manual trigger: Actions → Send Change Alerts → Run workflow

---

## 📚 Full Documentation

For detailed information, see:
- **SETUP_INSTRUCTIONS.md** - Comprehensive setup guide
- **docs/CHANGE_DETECTION_IMPLEMENTATION.md** - Technical details and API

---

## ✨ You're All Set!

Once you complete these 5 steps, your change detection system will be fully operational:

- ✅ Automatic change detection on every analysis
- ✅ Smart notifications based on severity
- ✅ Beautiful email alerts every 5 minutes
- ✅ Visual timeline and diff viewer
- ✅ User preferences and settings

**Time to complete:** ~10 minutes
**Result:** Production-ready change detection system! 🎉
