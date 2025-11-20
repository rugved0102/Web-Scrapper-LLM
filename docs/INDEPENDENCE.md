# 🔓 InsightEngine - Complete Independence Guide

## Overview

**This project is designed to run 100% independently after Lovable generates it.**

After development, you can:
- ✅ Fork and clone to your machine
- ✅ Run locally with free-tier services (Groq)
- ✅ Deploy to any platform (Vercel, Railway, Netlify, etc.)
- ✅ Use your own Supabase project
- ✅ Never pay Lovable again or depend on their infrastructure

---

## 🎯 What "Independent" Means

### 1. **No Lovable Runtime Dependencies**
- No calls to Lovable-specific APIs after deployment
- No Lovable authentication required
- No Lovable credits needed for operation
- Works completely offline with mock mode

### 2. **Free-Tier LLM (Groq)**
- Uses Groq's generous free tier by default
- ~30 requests per minute
- ~6,000 requests per day
- No credit card required to start

### 3. **Standard Supabase**
- Uses standard Supabase client libraries
- Works with ANY Supabase project
- Can be replaced with other backends (Express, Firebase, etc.)
- Edge functions are standard Deno code

### 4. **Deploy Anywhere**
- Frontend: Vercel, Netlify, Cloudflare Pages, GitHub Pages
- Backend: Supabase Cloud, self-hosted Deno, Express.js conversion
- Database: PostgreSQL (Supabase), MySQL, MongoDB (with adapter)
- No proprietary protocols or vendor-specific code

---

## 🚀 Complete Local Setup (Zero Dependencies)

### Step 1: Clone and Install

```bash
git clone <your-repo>
cd InsightEngine
npm install
```

### Step 2: Get Free API Keys

#### Groq API (LLM):
1. Go to https://console.groq.com
2. Sign up (free, no credit card)
3. Create API key
4. Copy key (starts with `gsk_`)

#### Supabase (Optional):
1. Go to https://supabase.com
2. Create new project (free tier)
3. Get URL and anon key from Settings → API

### Step 3: Configure Environment

```bash
cp .env.local.example .env
```

Edit `.env`:

```env
# Primary LLM: Groq (Free Tier)
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama3-8b-8192

# Supabase (use your own project or Lovable's)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Step 4: Run Locally

```bash
# Frontend
npm run dev

# Backend (edge functions) - in another terminal
npm install -g supabase
supabase functions serve analyze-websites --env-file .env
```

Visit: http://localhost:5173

**You're now running 100% locally with your own keys!**

---

## 🌐 Deploy Independently

### Option A: Vercel + Supabase Cloud

**Frontend (Vercel):**

```bash
# Push to GitHub first
git remote add origin <your-github-repo>
git push -u origin main

# Deploy to Vercel
npm install -g vercel
vercel

# Set environment variables in Vercel dashboard
# VITE_SUPABASE_URL
# VITE_SUPABASE_PUBLISHABLE_KEY
# VITE_SUPABASE_PROJECT_ID
```

**Backend (Supabase Cloud):**

```bash
# Login and link
supabase login
supabase link --project-ref your-project-id

# Deploy edge function
supabase functions deploy analyze-websites

# Set secrets
supabase secrets set GROQ_API_KEY=your_key
supabase secrets set LLM_PROVIDER=groq
supabase secrets set GROQ_MODEL=llama3-8b-8192
```

Done! Your app is live at `your-project.vercel.app`

---

### Option B: Netlify + Supabase Cloud

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Follow prompts to set environment variables
```

---

### Option C: Railway (Full-Stack)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up

# Set environment variables in Railway dashboard
```

---

### Option D: Self-Hosted (VPS/Docker)

**Build frontend:**

```bash
npm run build
# Serve dist/ folder with nginx, Caddy, or any static server
```

**Run edge function as Deno server:**

```typescript
// server.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

Deno.serve({ port: 8000 }, async (req) => {
  // Import and use your edge function handler
  const { handler } = await import("./supabase/functions/analyze-websites/index.ts");
  return handler(req);
});
```

```bash
deno run --allow-net --allow-env server.ts
```

---

## 🔧 Remove All Lovable Dependencies (Advanced)

If you want zero Lovable references:

### 1. Remove Lovable AI Provider

Edit `supabase/functions/analyze-websites/index.ts`:

```typescript
// Remove this entire block:
else if (LLM_PROVIDER === "lovable") {
  // ... lovable code ...
}

// Keep only:
if (LLM_PROVIDER === "groq") {
  // groq code
} else if (LLM_PROVIDER === "mock") {
  // mock code
} else {
  throw new Error("Unsupported provider");
}
```

### 2. Remove Supabase (Convert to Express)

**Create Express backend:**

```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  const { urls, purpose } = req.body;
  
  // Copy scraping logic from edge function
  const scrapedData = await scrapeWebsites(urls);
  
  // Call Groq API
  const insights = await callGroq(scrapedData, purpose);
  
  res.json({ success: true, insights });
});

app.listen(3001, () => console.log('Server on :3001'));
```

**Update frontend:**

```typescript
// src/pages/Index.tsx
const { data } = await fetch('http://localhost:3001/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ urls, purpose })
}).then(r => r.json());
```

---

## 💰 Cost Comparison

| Service | With Lovable | Independent (Groq) |
|---------|-------------|-------------------|
| **LLM API** | $X per request | FREE (up to 6k/day) |
| **Backend** | Lovable Cloud | Supabase FREE tier |
| **Frontend** | Lovable hosting | Vercel/Netlify FREE |
| **Total/month** | $X+ | **$0** |

---

## 🧪 Testing Independence

### Test 1: Run Without Internet (Mock Mode)

```env
LLM_PROVIDER=mock
```

```bash
npm run dev
```

Should work without any API calls!

### Test 2: Run With Only Groq

```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_key
# Remove all Supabase env vars
```

Should analyze websites successfully!

### Test 3: Deploy to Different Platform

Deploy to Vercel, Netlify, or Railway. Verify it works identically.

---

## 🔐 Security Checklist

- [ ] `.env` is in `.gitignore`
- [ ] No API keys committed to Git
- [ ] Service role key (if used) is NOT in frontend
- [ ] CORS configured correctly in edge function
- [ ] Rate limiting configured (if needed)
- [ ] API keys rotated before production

---

## 📊 Monitoring (Independent)

### Free Monitoring Options:

1. **Groq Console**: https://console.groq.com/usage
2. **Vercel Analytics**: Built-in (free)
3. **Supabase Dashboard**: Edge function logs
4. **Sentry**: Free tier for error tracking
5. **Uptime Robot**: Free uptime monitoring

---

## 🎓 Full Independence Checklist

After setup, verify you can:

- [ ] Clone repo and run locally without Lovable account
- [ ] Use Groq API with your own key
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Deploy backend to Supabase Cloud
- [ ] Run in mock mode offline
- [ ] Switch LLM providers (add OpenAI/Anthropic)
- [ ] Use different Supabase project
- [ ] Self-host on VPS if needed
- [ ] Convert to Express.js if desired
- [ ] Export and analyze data independently

---

## 📚 Additional Resources

- [Groq API Docs](https://console.groq.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Vercel Deployment](https://vercel.com/docs)
- [Deno Deploy Guide](https://deno.com/deploy/docs)
- [Express.js Documentation](https://expressjs.com)

---

## 💡 Key Takeaways

1. **No vendor lock-in**: Every service is replaceable
2. **Free-tier first**: Default to Groq (free) not paid services
3. **Standard tech**: React, Vite, Supabase, Deno - no proprietary code
4. **Deploy anywhere**: Works on any modern hosting platform
5. **You own the code**: Fork, modify, sell, deploy - it's yours

**You are completely independent from Lovable after code generation!** 🎉
