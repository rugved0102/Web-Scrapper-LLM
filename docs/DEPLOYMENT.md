# Deployment Guide - Independent from Lovable

This guide shows how to deploy **InsightEngine** completely independently, without requiring Lovable services after development.

---

## 🎯 Independence Overview

After Lovable generates this project, you can:

✅ **Fork/clone** the repository  
✅ **Run locally** with your own API keys  
✅ **Deploy anywhere** (Vercel, Railway, Netlify, etc.)  
✅ **Use free-tier LLMs** (Groq, HuggingFace, etc.)  
✅ **Connect to any Supabase project**  
✅ **Never depend on Lovable credits or services again**

---

## 📦 Prerequisites

- Node.js 18+ or Bun
- Supabase account (free tier is sufficient)
- Groq API key (free tier: https://console.groq.com)
- Git

---

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd InsightEngine
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Configure Environment Variables

Copy the example file and add your credentials:

```bash
cp .env.local.example .env
```

Edit `.env` with your actual values:

```env
# Use Groq for free LLM access
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your_actual_groq_key_here

# Your Supabase project credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### 4. Run the Frontend

```bash
npm run dev
```

Visit: http://localhost:5173

### 5. Run Supabase Edge Functions Locally

Install Supabase CLI:

```bash
npm install -g supabase
```

Start local Supabase (optional, for full local development):

```bash
supabase start
```

Serve edge functions locally:

```bash
supabase functions serve analyze-websites --env-file .env
```

The function will be available at: http://localhost:54321/functions/v1/analyze-websites

---

## ☁️ Deployment Options

### Option 1: Vercel (Frontend) + Supabase Cloud (Backend)

#### Deploy Frontend to Vercel:

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
5. Deploy

#### Deploy Edge Functions to Supabase:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Deploy edge functions
supabase functions deploy analyze-websites
```

Set secrets in Supabase:

```bash
supabase secrets set GROQ_API_KEY=your_groq_key_here
supabase secrets set LLM_PROVIDER=groq
supabase secrets set GROQ_MODEL=llama3-8b-8192
```

---

### Option 2: Netlify (Frontend) + Supabase Cloud (Backend)

Similar to Vercel:

1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy

Edge functions: Use Supabase Cloud (same as above)

---

### Option 3: Railway (Full-Stack)

1. Create new project on [Railway](https://railway.app)
2. Connect GitHub repository
3. Add environment variables (both frontend and edge function vars)
4. Railway will auto-detect Vite and deploy

For edge functions, you can:
- Use Supabase Cloud (recommended)
- Or convert to Express/Node.js endpoints (requires code changes)

---

### Option 4: Self-Hosted (VPS/Docker)

#### Frontend:

```bash
npm run build
# Serve the dist/ folder with nginx or any static server
```

#### Edge Functions:

Convert to a standalone Deno server:

```typescript
// server.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handler } from "./supabase/functions/analyze-websites/index.ts";

serve(handler, { port: 8000 });
```

Run with:

```bash
deno run --allow-net --allow-env server.ts
```

Or use Docker:

```dockerfile
FROM denoland/deno:1.38.0

WORKDIR /app
COPY . .

CMD ["run", "--allow-net", "--allow-env", "supabase/functions/analyze-websites/index.ts"]
```

---

## 🔧 Configuration Details

### LLM Provider Setup

#### Using Groq (Recommended - Free Tier):

1. Sign up at https://console.groq.com
2. Get API key from dashboard
3. Set in `.env`:
   ```env
   LLM_PROVIDER=groq
   GROQ_API_KEY=your_key_here
   GROQ_MODEL=llama3-8b-8192
   ```

Available models:
- `llama3-70b-8192` - Best quality, slower
- `llama3-8b-8192` - Balanced (default)
- `mixtral-8x7b-32768` - Good for long context

#### Using Other Providers:

You can extend `supabase/functions/analyze-websites/index.ts` to support:
- OpenAI
- Anthropic
- HuggingFace
- Local models (Ollama, LM Studio)

Example for OpenAI:

```typescript
else if (LLM_PROVIDER === "openai") {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: analysisPrompt },
      ],
    }),
  });
  // ... handle response
}
```

---

### Supabase Configuration

#### Using Your Own Supabase Project:

1. Go to https://supabase.com/dashboard
2. Create a new project (or use existing)
3. Get credentials from Settings → API:
   - Project URL
   - Anon/Public key
   - Service role key (for edge functions)
4. Update `.env` with these values

#### Edge Functions Secrets:

If deploying to Supabase Cloud:

```bash
# Set all required secrets
supabase secrets set GROQ_API_KEY=your_key
supabase secrets set LLM_PROVIDER=groq
supabase secrets set GROQ_MODEL=llama3-8b-8192
supabase secrets set GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
```

---

## 🧪 Testing Your Deployment

### 1. Test Mock Mode (No API Key Required)

Set `LLM_PROVIDER=mock` in `.env` and run:

```bash
npm run dev
```

Enter test URLs and verify you get dummy insights.

### 2. Test Groq Integration

Set `LLM_PROVIDER=groq` with your API key:

```bash
npm run dev
```

Analyze real websites - should return AI-generated insights.

### 3. End-to-End Test

1. Open app in browser
2. Enter 2-3 public URLs (e.g., news articles)
3. Select analysis purpose (e.g., "Business")
4. Click "Analyze"
5. Verify results appear with:
   - TL;DR summary
   - Key points
   - Deep insights
   - Recommendations

---

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** (especially after development)
4. **Use service role key only** in edge functions (never in frontend)
5. **Enable RLS** on Supabase tables if storing results
6. **Add rate limiting** in production (use Supabase edge function limits)

---

## 📊 Monitoring & Logs

### Supabase Edge Functions Logs:

```bash
supabase functions logs analyze-websites
```

Or view in Supabase Dashboard → Edge Functions → Logs

### Groq Usage:

Check your usage at: https://console.groq.com/usage

Free tier limits:
- 30 requests/minute
- ~6000 requests/day

---

## 🐛 Troubleshooting

### "GROQ_API_KEY not configured"

- Ensure `.env` has `GROQ_API_KEY=...`
- If deployed, set secret: `supabase secrets set GROQ_API_KEY=...`

### "Failed to fetch edge function"

- Check CORS configuration in edge function
- Verify Supabase URL is correct
- Ensure function is deployed: `supabase functions list`

### Rate Limit Errors

- Groq free tier: 30 req/min
- Add retry logic or upgrade to paid tier
- Use mock mode for testing

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

---

## 🎓 Advanced: Complete Independence

### Remove Supabase Dependency (Optional)

If you want to run without Supabase at all:

1. **Convert edge function to Express.js:**

```javascript
// server.js
const express = require('express');
const app = express();

app.post('/api/analyze', async (req, res) => {
  // Copy logic from supabase/functions/analyze-websites/index.ts
  // Make Groq API call directly
});

app.listen(3001);
```

2. **Update frontend to call your API:**

```typescript
// Instead of supabase.functions.invoke()
const response = await fetch('http://localhost:3001/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ urls, purpose })
});
```

3. **Deploy as a single service:**
   - Combine frontend + backend in one Docker container
   - Deploy to Railway/Render/Fly.io

---

## 📚 Additional Resources

- [Groq API Documentation](https://console.groq.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)

---

## ✅ Deployment Checklist

Before going to production:

- [ ] All environment variables set correctly
- [ ] API keys secured (not in code)
- [ ] Edge function deployed and tested
- [ ] Frontend deployed and accessible
- [ ] Error handling works (test with invalid URLs)
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Monitoring/logging set up
- [ ] Backup Groq key stored securely
- [ ] Documentation updated for team

---

## 🆘 Need Help?

1. Check edge function logs: `supabase functions logs`
2. Test with mock mode first: `LLM_PROVIDER=mock`
3. Verify API keys are valid
4. Ensure all dependencies installed
5. Review console logs in browser DevTools

**This project is 100% independent after development. No Lovable services required!** 🚀
