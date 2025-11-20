# Scraping JavaScript-Heavy Websites (Reddit, Twitter, etc.)

## Problem

Modern websites like Reddit, Twitter/X, Instagram, and Facebook use JavaScript frameworks (React, Vue, Angular) that render content dynamically. When you fetch their HTML with a simple HTTP request, you only get an empty skeleton.

**Example - Reddit HTML without JavaScript:**
```html
<div id="root"></div>
<script src="bundle.js"></script>
```

The actual content is rendered by JavaScript AFTER the page loads, which a simple HTTP scraper cannot execute.

---

## Solution: Browserless.io

**Browserless.io** provides headless browser scraping as a service. Instead of running Playwright/Puppeteer locally (which doesn't work in Supabase Edge Functions), we send the URL to Browserless and they:

1. Open a real Chrome browser
2. Load the page
3. Wait for JavaScript to execute
4. Return the fully-rendered HTML

---

## Setup Instructions

### 1. Get a Free Browserless.io Account

1. Visit: https://www.browserless.io
2. Click **Start for Free**
3. Sign up (no credit card required)
4. Free tier includes **6 hours/month** of browser time

### 2. Get Your API Token

1. Log in to Browserless.io
2. Go to **Account → API Keys**
3. Copy your API token (looks like: `abc123def456...`)

### 3. Set the Environment Variable

**For Local Development:**

Add to your `.env.local` file:
```env
BROWSERLESS_API_KEY=your_token_here
```

**For Production (Supabase):**

```bash
supabase secrets set BROWSERLESS_API_KEY=your_token_here
```

### 4. Test It!

Try analyzing this Reddit URL:
```
https://www.reddit.com/r/programming/
```

You should now see actual content instead of "Limited content extracted" errors.

---

## How It Works

The scraper automatically detects JavaScript-heavy domains:

```typescript
const jsHeavyDomains = ["reddit.com", "twitter.com", "x.com", "instagram.com", "facebook.com"];
```

**Scraping Flow:**

1. **Detect JS-heavy domain** → Use Browserless.io
2. **403/401 errors** → Retry with Browserless.io
3. **Browserless fails or not configured** → Fallback to HTTP

**In the logs, you'll see:**
```
Detected JS-heavy site, trying browser scraping first...
Successfully scraped https://reddit.com with browser (45678 chars)
Extracted 10000 characters from https://reddit.com (via browser)
```

---

## Supported Websites

### With Browserless.io Enabled:
- ✅ Reddit (all subreddits)
- ✅ Twitter/X (public tweets)
- ✅ Instagram (public profiles)
- ✅ Facebook (public pages)
- ✅ Modern SPAs (Single Page Applications)
- ✅ Sites with dynamic content loading

### Without Browserless.io:
- ✅ Wikipedia
- ✅ News sites (CNN, BBC, etc.)
- ✅ Blogs
- ✅ Documentation sites
- ✅ GitHub
- ⚠️ Limited Reddit/Twitter support

---

## Cost & Usage

**Free Tier:**
- **6 hours/month** of browser time
- Each page scrape takes ~5-15 seconds
- **Estimate:** 1,440 - 2,880 page scrapes per month

**Monitoring Usage:**
1. Go to https://www.browserless.io/account
2. View **Usage** tab
3. See hours consumed this month

**What Happens When You Run Out?**
- Browserless API will return errors
- Scraper automatically falls back to HTTP mode
- No crashes or failures
- You'll just get limited content from JS-heavy sites

---

## Troubleshooting

### "BROWSERLESS_API_KEY not set" in logs
- The scraper is working in HTTP-only mode
- Optional: Add the key to enable browser scraping

### "Browserless failed for {url}: 401"
- Your API token is invalid or expired
- Get a new token from Browserless.io dashboard

### "Browserless failed for {url}: 402"
- You've exceeded your free tier hours
- Wait until next month or upgrade plan
- Scraper will fall back to HTTP mode

### Still getting "Limited content" from Reddit
1. Check if `BROWSERLESS_API_KEY` is set in Supabase secrets:
   ```bash
   supabase secrets list
   ```
2. Check edge function logs for errors:
   ```bash
   supabase functions logs analyze-websites
   ```
3. Verify your API token at https://www.browserless.io/account

---

## Alternative Solutions

### Why Not Run Playwright Directly?

**Playwright/Puppeteer can't run in Supabase Edge Functions because:**
- No Chrome/Chromium binary available in Deno Deploy
- ~200MB+ browser download required
- Slow cold starts (10+ seconds)
- High memory usage (~512MB per instance)

**Browserless.io solves this by:**
- Running browsers on their infrastructure
- Fast, reliable, scalable
- Pay-per-use model
- No infrastructure management

### Other Options (Not Recommended)

1. **Self-hosted Browserless** - Complex, requires Docker
2. **Separate scraping service** - Extra infrastructure
3. **Client-side scraping** - CORS issues, unreliable
4. **Proxy services** - Expensive, ethical concerns

---

## Example: Before vs After

### Before (Without Browserless.io)

**Input:** `https://www.reddit.com/r/programming/`

**Output:**
```
Limited content extracted from https://www.reddit.com/r/programming/. 
This website may require JavaScript to display its content.
```

**Analysis:**
- Only got page title and meta tags
- No actual posts or comments
- AI can't generate meaningful insights

---

### After (With Browserless.io)

**Input:** `https://www.reddit.com/r/programming/`

**Output:**
```
Extracted 10000 characters from https://www.reddit.com/r/programming/ (via browser)
```

**Content includes:**
- Post titles and descriptions
- Comment snippets
- Sidebar information
- Community details

**Analysis:**
- Full AI-powered insights
- Key discussion topics
- Trending themes
- Actionable recommendations

---

## Best Practices

### 1. Test Locally First
Before enabling in production, test with your free tier:
```bash
# Set in .env.local
BROWSERLESS_API_KEY=your_token

# Run locally
npm run dev
supabase functions serve --env-file .env.local
```

### 2. Monitor Usage
Check your Browserless dashboard weekly to avoid surprises.

### 3. Fallback Gracefully
The scraper is designed to work with or without Browserless. Users won't see errors if it's not configured.

### 4. Rate Limiting
Don't analyze 100 Reddit URLs at once - you'll burn through your free tier quickly.

### 5. Cache Results
Consider saving analysis results to avoid re-scraping the same URLs.

---

## Security Notes

- ✅ API token is stored securely in Supabase secrets
- ✅ Never exposed to frontend
- ✅ HTTPS-only communication
- ✅ No browser data stored by Browserless (check their privacy policy)

---

## Summary

**Without Browserless.io:**
- Basic HTTP scraping
- Works for static sites
- Reddit/Twitter fail

**With Browserless.io:**
- Full JavaScript rendering
- Works for all modern sites
- 6 hours/month free
- Automatic fallback if disabled

**Setup time:** ~5 minutes
**Cost:** Free for most use cases
**Benefit:** Unlock Reddit, Twitter, Instagram, and hundreds of modern websites

---

## Support

- **Browserless.io Docs:** https://docs.browserless.io
- **Get Help:** https://www.browserless.io/contact
- **InsightEngine Issues:** https://github.com/rugved0102/Web-Scrapper-LLM/issues
