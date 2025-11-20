# InsightEngine - AI-Powered Multi-Website Analysis

> Created by [Rugved](https://github.com/rugved0102)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [Local Development Setup](#local-development-setup)
  - [Groq API Setup (Free Tier)](#groq-api-setup-free-tier)
  - [Running Without API Keys (Mock Mode)](#running-without-api-keys-mock-mode)
- [How to Run](#how-to-run)
  - [Development Mode](#development-mode)
  - [Running Edge Functions Locally](#running-edge-functions-locally)
- [How to Use](#how-to-use)
- [Feature Details](#feature-details)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [LLM Provider Configuration](#llm-provider-configuration)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Testing & Acceptance Criteria](#testing--acceptance-criteria)

---

## Overview

**InsightEngine** is an intelligent web application that analyzes multiple websites simultaneously and generates AI-powered insights based on your chosen purpose. Think of it as a smart assistant that reads websites for you, compares their content, and provides actionable recommendations.

### What Problem Does It Solve?

When you need to:
- Research competitors in your industry
- Compare information across multiple sources
- Extract key insights from various websites
- Get AI-powered recommendations based on web content
- Save time by not manually reading through multiple sites

InsightEngine automates this entire process using AI.

---

## Features

### 1. **Multi-URL Input System**
- Add multiple website URLs (as many as you need)
- Real-time URL validation
- Add/remove URLs dynamically
- Clean, intuitive interface

### 2. **Purpose-Based Analysis**
Choose from 6 different analysis modes:
- 🏢 **Business Intelligence**: Market trends, opportunities, strategies
- 🔬 **Scientific Research**: Methodology, findings, gaps
- 🎯 **Competitive Analysis**: Competitor comparisons, strengths/weaknesses
- 📊 **Market Trends**: Industry patterns, emerging trends
- 💡 **Content Strategy**: Content quality, SEO insights
- 🌐 **General Analysis**: Comprehensive overview

### 3. **Intelligent Web Scraping**
- Automated content extraction from websites
- Works best with static HTML sites (Wikipedia, news, blogs)
- Handles various website structures
- Extracts clean, readable text
- Progress tracking during scraping
- Graceful handling of JavaScript-heavy sites with informative warnings

### 4. **AI-Powered Insight Generation**
- Uses Groq API with Llama 3.1 models
- Context-aware analysis based on your purpose
- Generates:
  - Executive summaries
  - Key findings
  - Deep insights
  - Cross-source comparisons
  - Actionable recommendations
  - Domain-specific insights

### 5. **Beautiful Results Display**
- Organized into categories
- Color-coded sections
- Smooth animations
- Professional, data-rich design
- Easy to read and export

---

## Technology Stack

### Frontend
- **React 18**: UI library
- **TypeScript**: Type-safe code
- **Vite**: Fast build tool
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components
- **Lucide React**: Icons
- **React Router**: Navigation
- **Zod**: URL validation

### Backend
- **Supabase**: Backend platform
- **Edge Functions**: Serverless functions (Deno runtime)
- **PostgreSQL**: Database with pgvector extension

### AI/ML
- **Groq API**: Fast LLM inference
- **Llama 3.1**: Language model (8B & 70B variants)
- **Xenova Transformers**: Semantic embeddings (all-MiniLM-L6-v2)
- **Web Scraping**: Cheerio-like parsing
- **Content Extraction**: HTML-to-text processing

---

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **Git** (for cloning)
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

4. **A Groq Account** (Free)
   - Sign up at [console.groq.com](https://console.groq.com)
   - Get free API key for LLM access

---

## Setup Instructions

### Local Development Setup

This project runs **completely locally** using **Groq's free-tier API** for LLM capabilities and Supabase for backend infrastructure.

#### Step 1: Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd insightengine
```

#### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

#### Step 3: Configure Environment Variables

1. **Copy the example environment file:**

```bash
cp .env.example .env
```

2. **Edit `.env` and configure the following:**

```env
# LLM Provider (choose one: "groq", "openai", or "mock")
LLM_PROVIDER=groq

# Groq API Key (get free key at https://console.groq.com)
GROQ_API_KEY=gsk_your_actual_groq_api_key_here

# Groq Configuration (optional - defaults work fine)
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama3-8b-8192

# Supabase Configuration
VITE_SUPABASE_URL=https://xxrhqvocwwpukxiidazn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=xxrhqvocwwpukxiidazn
```

**Important:** Never commit your `.env` file! It's already in `.gitignore`.

---

### Groq API Setup (Free Tier)

**Groq offers a generous free tier** with fast inference on open-source models like Llama 3.

#### How to Get Your Groq API Key:

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy your key (starts with `gsk_`)
6. Paste it into your `.env` file as `GROQ_API_KEY`

#### Available Groq Models:

You can choose from several models by setting `GROQ_MODEL` in your `.env`:

- `llama3-8b-8192` (default) - Fast, efficient, 8K context
- `llama3-70b-8192` - More capable, slower, 8K context
- `mixtral-8x7b-32768` - Great for reasoning, 32K context
- `gemma-7b-it` - Google's Gemma model

**Recommendation:** Start with `llama3-8b-8192` for speed, upgrade to `llama3-70b-8192` for better insights.

---

### Browserless.io Setup (Optional - For JavaScript-Heavy Sites)

**Browserless.io enables scraping of Reddit, Twitter/X, Instagram, and other modern JavaScript-heavy websites.**

#### Why Use Browserless.io?

Modern websites like Reddit use JavaScript frameworks (React, Vue) that don't render content in the initial HTML. A headless browser is needed to execute JavaScript and get the actual content.

#### Free Tier Includes:
- **6 hours/month** of browser time
- Perfect for occasional scraping of JS-heavy sites
- No credit card required

#### How to Get Your Browserless.io API Key:

1. Visit [https://www.browserless.io](https://www.browserless.io)
2. Click **Start for Free**
3. Sign up for a free account
4. Navigate to **Account → API Keys**
5. Copy your API token
6. Paste it into your `.env` file as `BROWSERLESS_API_KEY`

#### What Happens When Enabled?

The scraper will automatically use browser-based scraping for:
- ✅ Reddit (reddit.com)
- ✅ Twitter/X (twitter.com, x.com)
- ✅ Instagram (instagram.com)
- ✅ Facebook (facebook.com)
- ✅ Other detected JS-heavy sites

If Browserless fails or isn't configured, it falls back to standard HTTP scraping.

#### Cost Monitoring:

Check your usage at [https://www.browserless.io/account](https://www.browserless.io/account)
- Each site scrape uses ~5-15 seconds of browser time
- 6 hours = 1,440-2,880 page scrapes per month

**Note:** If you exceed the free tier, Browserless will simply stop working and the scraper will fall back to HTTP mode.

---

### Running Without API Keys (Mock Mode)

You can test the entire application flow **without any API keys** using mock mode:

1. Set `LLM_PROVIDER=mock` in your `.env`
2. The edge function will return deterministic dummy insights
3. Perfect for:
   - UI/UX testing
   - Frontend development
   - CI/CD pipelines
   - Demos without API costs

**Mock mode response example:**
```json
{
  "tldr": "Mock analysis of 3 websites with business focus.",
  "key_points": ["Analyzed 3 websites", "Mock insight: Content extracted"],
  "recommendations": ["Add GROQ_API_KEY to enable real analysis"]
}
```

---

### Supabase Configuration

This project uses **Supabase** for the backend (edge functions, optional database).

#### Using the Pre-configured Supabase Project:

The project comes with a Supabase project already configured. The credentials are in the `.env` file:

```env
VITE_SUPABASE_URL=https://xxrhqvocwwpukxiidazn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_SUPABASE_PROJECT_ID=xxrhqvocwwpukxiidazn
```

#### Using Your Own Supabase Project:

If you want to use your own Supabase project:

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Navigate to **Settings → API**
4. Copy the following values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon/Public Key** → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Project ID** → `VITE_SUPABASE_PROJECT_ID`
5. Update your `.env` file with these values

#### Edge Function Secrets:

For the edge function to work, you need to set secrets in Supabase:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref xxrhqvocwwpukxiidazn

# Set secrets
supabase secrets set GROQ_API_KEY=gsk_your_actual_key_here
supabase secrets set LLM_PROVIDER=groq
supabase secrets set GROQ_MODEL=llama3-8b-8192

# Optional: Enable browser scraping for Reddit, Twitter, etc.
supabase secrets set BROWSERLESS_API_KEY=your_browserless_token_here
```

**Note:** You can also set secrets in the Supabase Dashboard under Project Settings → Edge Functions.

---

## How to Run

### Development Mode

#### 1. Start the Frontend (React + Vite)

```bash
npm run dev
```

This will:
- Start the Vite development server
- Open your browser to `http://localhost:5173`
- Enable hot module reloading (changes appear instantly)

#### 2. Running Edge Functions Locally

**Option A: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Start local Supabase (includes edge functions)
supabase start

# Deploy edge functions locally
supabase functions serve analyze-websites --env-file .env
```

The edge function will be available at:
```
http://localhost:54321/functions/v1/analyze-websites
```

**Option B: Using Deno directly**

```bash
# Install Deno (if not already installed)
curl -fsSL https://deno.land/install.sh | sh

# Run the edge function
deno run \
  --allow-net \
  --allow-env \
  --watch \
  supabase/functions/analyze-websites/index.ts
```

#### 3. Testing the Full Stack Locally

With both frontend and edge function running:

1. Open `http://localhost:5173` in your browser
2. Enter 2-3 URLs (try public sites like Wikipedia, GitHub, etc.)
3. Select a purpose (e.g., "Business Intelligence")
4. Click **Analyze Websites**
5. Watch the progress bar and see insights appear

---

### Build for Production

Create an optimized production build:

```bash
npm run build
```

The build will create a `dist/` folder with optimized static files.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

This serves the production build at `http://localhost:4173`.

---

### Deploying to Production

#### Deploy to Supabase Edge Functions:

```bash
# Deploy the edge function
supabase functions deploy analyze-websites

# Verify it's running
supabase functions list
```

#### Deploy Frontend:

You can deploy the frontend to:
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **Cloudflare Pages**: `wrangler pages publish dist`

**Important:** Make sure to set environment variables in your hosting platform's settings.

---

## How to Use

### Step-by-Step Usage Guide

#### 1. **Open the Application**
Navigate to `http://localhost:5173` in your browser.

#### 2. **Choose Your Purpose**
Select one of the 6 analysis modes based on what you want to learn:
- Business Intelligence
- Scientific Research
- Competitive Analysis
- Market Trends
- Content Strategy
- General Analysis

#### 3. **Enter Website URLs**
- Type or paste a website URL in the input field
- Click "+ Add URL" to add more websites
- Click the X button to remove a URL
- The app validates URLs automatically

#### 4. **Analyze**
- Click the "Analyze Websites" button
- Watch the progress bar as it:
  - Scrapes each website
  - Analyzes content
  - Generates insights

#### 5. **View Results**
Results are organized into sections:
- **📋 Summary**: Quick overview
- **🔍 Key Findings**: Main discoveries
- **💡 Deep Insights**: Detailed analysis
- **⚡ Comparisons**: Cross-source analysis
- **🎯 Recommendations**: Actionable advice
- **🎓 Domain-Specific**: Purpose-specific insights

---

## Feature Details

### 1. URL Input Component (`URLInput.tsx`)

**Location**: `src/components/InsightEngine/URLInput.tsx`

**What It Does**:
- Manages multiple URL inputs dynamically
- Validates URLs using Zod schema
- Displays error messages for invalid URLs
- Allows adding/removing URL fields

**Key Code**:
```typescript
const urlSchema = z.string().url({ message: "Please enter a valid URL" });
```

**Features**:
- Real-time validation
- Error highlighting
- Dynamic field management
- Clean, responsive UI

---

### 2. Purpose Selector (`PurposeSelector.tsx`)

**Location**: `src/components/InsightEngine/PurposeSelector.tsx`

**What It Does**:
- Displays 6 pre-defined analysis purposes
- Each purpose has a unique icon and description
- Selected purpose changes the AI analysis focus

**Purpose Types**:
```typescript
type PurposeMode = 
  | "business"
  | "research"
  | "competitive"
  | "trends"
  | "content"
  | "general"
```

**How It Works**:
- User clicks a card to select a purpose
- Selected purpose is highlighted
- Purpose is sent to the backend for AI prompt customization

---

### 3. Scraping Progress (`ScrapingProgress.tsx`)

**Location**: `src/components/InsightEngine/ScrapingProgress.tsx`

**What It Does**:
- Shows real-time progress during analysis
- Three stages:
  1. **Scraping**: Fetching website content
  2. **Analyzing**: AI processing
  3. **Complete**: Results ready

**Visual Feedback**:
- Animated progress bar
- Current URL being processed
- Stage-based status messages
- Smooth transitions

---

### 4. Insight Display (`InsightDisplay.tsx`)

**Location**: `src/components/InsightEngine/InsightDisplay.tsx`

**What It Does**:
- Renders AI-generated insights in organized sections
- Each section has:
  - A unique icon
  - Colored badge
  - Formatted content
  - Smooth animations

**Insight Categories**:
1. **Summary** (`tldr`): One-line overview
2. **Key Findings** (`key_points`): Bullet points
3. **Deep Insights** (`deep_insights`): Detailed analysis
4. **Comparisons** (`conflicts_across_sources`): Cross-website analysis
5. **Recommendations** (`recommendations`): Actionable steps
6. **Domain-Specific** (`domain_specific_insights`): Purpose-based insights

**Dynamic Display**:
- Only shows sections with data
- Handles arrays and strings
- Beautiful card layouts
- Gradient accents

---

### 5. Main Page (`Index.tsx`)

**Location**: `src/pages/Index.tsx`

**What It Does**:
- Orchestrates the entire user flow
- Manages application state
- Handles API communication
- Displays loading states and results

**State Management**:
```typescript
const [purpose, setPurpose] = useState<PurposeMode>("business");
const [isLoading, setIsLoading] = useState(false);
const [insights, setInsights] = useState<InsightData | null>(null);
const [progress, setProgress] = useState(0);
const [status, setStatus] = useState<"scraping" | "analyzing" | "complete">("scraping");
```

**Error Handling**:
- Rate limit (429): Too many requests
- Payment required (402): Add credits
- Generic errors: Descriptive messages

---

### 6. Backend Edge Function (`analyze-websites/index.ts`)

**Location**: `supabase/functions/analyze-websites/index.ts`

**What It Does**:
- Receives URLs and purpose from frontend
- Scrapes each website
- Extracts clean text content
- Sends to Groq API for analysis
- Returns structured insights

**Scraping Process**:
```typescript
1. Fetch HTML from URL
2. Parse HTML content
3. Extract text from paragraphs, headings, lists
4. Clean and format text
5. Return as structured data
```

**AI Integration**:
```typescript
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${GROQ_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ]
  })
});
```

**System Prompt**:
The backend generates a dynamic system prompt based on the selected purpose:
- Business → Focus on market opportunities, strategies
- Research → Focus on methodology, findings
- Competitive → Focus on comparisons, differentiators
- etc.

**Output Format**:
```json
{
  "tldr": "One-line summary",
  "key_points": ["Point 1", "Point 2"],
  "deep_insights": ["Insight 1", "Insight 2"],
  "conflicts_across_sources": ["Conflict 1"],
  "recommendations": ["Recommendation 1"],
  "domain_specific_insights": ["Domain insight 1"]
}
```

---

## Architecture

### High-Level Flow

```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │
       │ 1. User inputs URLs + selects purpose
       │
       ▼
┌─────────────────────────┐
│   Index.tsx (Main Page) │
│   - State management    │
│   - API calls           │
└──────┬──────────────────┘
       │
       │ 2. POST /functions/v1/analyze-websites
       │
       ▼
┌────────────────────────────────┐
│   Edge Function (Backend)      │
│   - Web scraping               │
│   - Content extraction         │
│   - AI prompt generation       │
└──────┬─────────────────────────┘
       │
       │ 3. POST to Groq API
       │
       ▼
┌────────────────────────────┐
│   Groq API (Llama 3.1)     │
│   - Content analysis       │
│   - Insight generation     │
└──────┬─────────────────────┘
       │
       │ 4. Returns structured JSON
       │
       ▼
┌────────────────────────────┐
│   InsightDisplay Component │
│   - Renders results        │
└────────────────────────────┘
```

### Data Flow

1. **User Input** → URLs + Purpose
2. **Frontend** → Validates and sends to backend
3. **Backend** → Scrapes websites
4. **Backend** → Calls Groq API with scraped content
5. **Groq AI** → Generates insights
6. **Backend** → Returns JSON to frontend
7. **Frontend** → Displays formatted results

---

## Project Structure

```
insightengine/
├── src/
│   ├── components/
│   │   ├── InsightEngine/
│   │   │   ├── URLInput.tsx           # URL input with validation
│   │   │   ├── PurposeSelector.tsx    # Purpose selection cards
│   │   │   ├── ScrapingProgress.tsx   # Progress tracking
│   │   │   └── InsightDisplay.tsx     # Results display
│   │   └── ui/                        # shadcn components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       └── ... (other UI components)
│   ├── pages/
│   │   └── Index.tsx                  # Main application page
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts              # Supabase client setup
│   │       └── types.ts               # TypeScript types
│   ├── hooks/                         # Custom React hooks
│   ├── lib/
│   │   └── utils.ts                   # Utility functions
│   ├── index.css                      # Design system tokens
│   └── main.tsx                       # App entry point
├── supabase/
│   ├── functions/
│   │   └── analyze-websites/
│   │       └── index.ts               # Edge function for analysis
│   └── config.toml                    # Supabase configuration
├── public/                            # Static assets
├── .env                               # Environment variables
├── package.json                       # Dependencies
├── tailwind.config.ts                 # Tailwind configuration
├── vite.config.ts                     # Vite configuration
└── README.md                          # This file!
```

---

## Design System

### Color Palette

The app uses a sophisticated color system defined in `src/index.css`:

**Light Mode**:
- Background: Soft whites and grays
- Primary: Deep blue (#2563eb)
- Accent: Electric teal (#06b6d4)

**Dark Mode**:
- Background: Deep navy and charcoal
- Primary: Bright blue
- Accent: Cyan glow

### Semantic Tokens

All colors use semantic tokens:
```css
--background
--foreground
--primary
--primary-foreground
--secondary
--accent
--muted
--border
```

### Gradients

```css
--gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
--gradient-subtle: linear-gradient(180deg, hsl(var(--background)), hsl(var(--muted)));
```

### Shadows

```css
--shadow-elegant: 0 10px 30px -10px rgba(37, 99, 235, 0.3);
--shadow-glow: 0 0 40px rgba(6, 182, 212, 0.4);
```

---

## 🎛 LLM Provider Configuration

InsightEngine supports **multiple LLM providers** through a unified interface.

### Switching Providers

Edit your `.env` file and change `LLM_PROVIDER`:

```env
# Use Groq (recommended for local development)
LLM_PROVIDER=groq

# Use OpenAI (if you add OpenAI support)
LLM_PROVIDER=openai

# Use mock mode (no API calls, for testing)
LLM_PROVIDER=mock
```

### Provider Comparison

| Provider | Cost | Speed | Setup | Best For |
|----------|------|-------|-------|----------|
| **Groq** | Free tier + paid | Very fast | API key required | Production, local dev |
| **OpenAI** | Pay-as-you-go | Fast | API key required | High-quality insights |
| **Mock** | Free | Instant | No setup | Testing, demos |

### Custom LLM Models

#### Groq Models

Set `GROQ_MODEL` in `.env`:

```env
GROQ_MODEL=llama3-8b-8192         # Fast, efficient (default)
GROQ_MODEL=llama3-70b-8192        # More capable
GROQ_MODEL=mixtral-8x7b-32768     # Best reasoning
GROQ_MODEL=gemma-7b-it            # Google Gemma
```

#### Adding New Providers

To add support for other providers (e.g., OpenAI, Anthropic, HuggingFace):

1. Edit `supabase/functions/analyze-websites/index.ts`
2. Add a new `else if` branch in the `callLLM()` function
3. Implement the API call following the existing pattern
4. Update `.env.example` with required keys

Example:

```typescript
else if (LLM_PROVIDER === "openai") {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  // Implement OpenAI API call
}
```

---

## Troubleshooting

### Common Issues

#### 1. **"Cannot fetch URL" Error**

**Cause**: Website blocks scraping or requires authentication

**Solution**: 
- Try a different URL
- Ensure the URL is publicly accessible
- Check if the website allows scraping

#### 2. **"Rate Limit Exceeded" (429 Error)**

**Cause**: Too many requests in a short time

**Solution**:
- Wait a few minutes before trying again
- Reduce the number of URLs
- Groq free tier has generous limits - should be sufficient for most use cases

#### 3. **"Unauthorized" (401 Error)**

**Cause**: Invalid or expired Groq API key

**Solution**:
- Verify your API key is correct in `.env`
- Generate a new key at [console.groq.com](https://console.groq.com)
- Update Supabase secrets if deployed

#### 4. **Port Already in Use**

**Error**: `Port 5173 is already in use`

**Solution**:
```bash
# Kill the process using the port (Mac/Linux)
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

#### 5. **Slow Analysis**

**Cause**: Large websites or many URLs

**Solution**:
- Analyze fewer URLs at once
- Be patient (AI processing takes time)
- Consider implementing caching (future feature)

#### 6. **"GROQ_API_KEY not configured" Error**

**Cause**: Missing or invalid Groq API key

**Solution**:
1. Get a free API key from [console.groq.com](https://console.groq.com)
2. Add it to your `.env` file: `GROQ_API_KEY=gsk_...`
3. If running edge function locally: restart the function
4. If in Supabase Cloud: set the secret using `supabase secrets set`

#### 7. **Edge Function Not Found**

**Cause**: Edge function not deployed or not running locally

**Solution**:
```bash
# For local development
supabase functions serve analyze-websites

# For production
supabase functions deploy analyze-websites
```

#### 8. **CORS Errors**

**Cause**: Frontend can't connect to edge function

**Solution**:
- Ensure edge function includes CORS headers (already implemented)
- Check that `VITE_SUPABASE_URL` in `.env` is correct
- Verify edge function is accessible at the expected URL

---

## FAQ

### Q: How many URLs can I analyze at once?
**A**: There's no hard limit, but we recommend 3-5 URLs for optimal performance and reasonable processing time.

### Q: What types of websites work best?
**A**: **All websites are supported with the right configuration:**

**Without Browserless.io (Basic HTTP Scraping):**
- ✅ Wikipedia and educational sites
- ✅ News articles and blogs
- ✅ Documentation sites
- ✅ Business websites with static content
- ✅ GitHub repositories
- ⚠️ Limited support for JavaScript-heavy sites

**With Browserless.io (Browser-Based Scraping):**
- ✅ **Reddit** - Full content access
- ✅ **Twitter/X** - Tweets and threads
- ✅ **Instagram** - Public posts
- ✅ **Facebook** - Public pages
- ✅ All static HTML sites (as above)
- ❌ Sites behind login walls (still restricted)

### Q: Can I analyze websites in different languages?
**A**: Yes! Gemini 2.5 Flash supports multiple languages. The insights will be generated in the language of the source content.

### Q: How long does analysis take?
**A**: Typically 10-30 seconds depending on:
- Number of URLs
- Website size
- AI processing time

### Q: Is my data stored?
**A**: Currently, no data is stored. Each analysis is processed in real-time and results are only displayed in your session.

### Q: Can I export results?
**A**: Not yet! This is a great feature for the future. Currently, you can copy/paste from the results display.

### Q: How accurate are the insights?
**A**: Insights are generated by Google's Gemini 2.5 Flash, one of the most advanced AI models. However, always verify critical information from the original sources.

### Q: Can I analyze password-protected sites?
**A**: No, the scraper can only access publicly available content.

### Q: What if a website doesn't load?
**A**: The app will skip that URL and continue analyzing others. You'll see an error in the console.

### Q: Can I use this completely offline?
**A**: The frontend runs locally, but you need internet access for Groq API calls. Use mock mode for offline testing without API calls.

### Q: Do I need a Supabase account?
**A**: Only if you want to deploy the edge function to production. For local development, you can use the Supabase CLI without an account.

### Q: Which LLM provider is cheapest?
**A**: Groq offers a generous free tier with fast inference. Mock mode is completely free (no API calls).

### Q: Can I use OpenAI or Anthropic instead?
**A**: Yes, you can add support by modifying the `callLLM()` function in the edge function. See [LLM Provider Configuration](#llm-provider-configuration).

---

## Testing & Acceptance Criteria

### End-to-End Test (Manual)

Run this test to verify everything works:

#### 1. **Test with Groq (Real LLM)**

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# 2. Start frontend
npm run dev

# 3. Start edge function (in another terminal)
supabase functions serve analyze-websites --env-file .env

# 4. Open browser to http://localhost:5173
# 5. Enter these test URLs:
#    - https://en.wikipedia.org/wiki/Artificial_intelligence
#    - https://github.com/features
#    - https://groq.com

# 6. Select purpose: "Business Intelligence"
# 7. Click "Analyze Websites"
# 8. Verify you see real insights with categories:
#    ✓ Summary (tldr)
#    ✓ Key Findings (key_points array)
#    ✓ Deep Insights (deep_insights array)
#    ✓ Comparisons (conflicts_across_sources)
#    ✓ Recommendations (recommendations array)
```

**Expected Result:** Real AI-generated insights based on scraped content.

---

#### 2. **Test with Mock Mode (No API)**

```bash
# 1. Edit .env
LLM_PROVIDER=mock

# 2. Restart edge function
# 3. Repeat test above
# 4. Verify you see mock insights with helpful setup instructions
```

**Expected Result:** Deterministic mock response with setup recommendations.

---

#### 3. **Test Error Handling**

```bash
# Test invalid API key
GROQ_API_KEY=invalid_key_test
# Expected: Error message "Invalid Groq API key"

# Test missing API key
unset GROQ_API_KEY
# Expected: Falls back to mock mode or shows setup instructions

# Test bad URL
# Enter: "not-a-valid-url"
# Expected: URL validation error in UI
```

---

### Automated Tests (Optional)

Create a test script `test.sh`:

```bash
#!/bin/bash
set -e

echo "🧪 Running InsightEngine tests..."

# Test 1: Check environment setup
echo "✓ Checking .env.example exists..."
test -f .env.example

# Test 2: Validate edge function syntax
echo "✓ Validating edge function TypeScript..."
deno check supabase/functions/analyze-websites/index.ts

# Test 3: Test mock mode
echo "✓ Testing mock mode..."
export LLM_PROVIDER=mock
export VITE_SUPABASE_URL=http://localhost:54321
# Add actual edge function call test here

echo "✅ All tests passed!"
```

---

### Acceptance Checklist

Before marking this feature complete, verify:

- [ ] `.env.example` exists with all required variables documented
- [ ] Edge function supports `LLM_PROVIDER=groq` and calls Groq API successfully
- [ ] Edge function supports `LLM_PROVIDER=mock` and returns dummy JSON
- [ ] Edge function supports multiple LLM providers (extensible architecture)
- [ ] Frontend displays insights in all 6 categories (tldr, key_points, etc.)
- [ ] Error handling works for invalid/missing API keys
- [ ] README includes "Local Setup" section with Groq instructions
- [ ] README includes "Testing" section with acceptance criteria
- [ ] No secrets (API keys) committed to git (check `.gitignore`)
- [ ] Edge function includes proper CORS headers
- [ ] Edge function logs errors and provider info to console
- [ ] Frontend shows loading states during scraping and analysis
- [ ] Frontend handles 429 (rate limit) and 402 (payment) errors gracefully
- [ ] Project builds successfully with `npm run build`
- [ ] Edge function can be deployed with `supabase functions deploy`

---

## Future Enhancements

Potential features to add:

1. **Result Export**: Download insights as PDF or JSON
2. **History**: Save and view past analyses
3. **Scheduling**: Automated periodic analysis
4. **Advanced Scraping**: Handle JavaScript-heavy sites
5. **Custom Purposes**: User-defined analysis prompts
6. **Comparison Mode**: Side-by-side website comparison
7. **API Access**: RESTful API for programmatic access
8. **Collaboration**: Share analyses with team members
9. **Email Reports**: Automated insight delivery
10. **Chrome Extension**: Analyze current tab

---

## Additional Resources

### Learning Materials
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Guides](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Related Projects
- [Perplexity AI](https://www.perplexity.ai/)
- [Ahrefs](https://ahrefs.com/)
- [SEMrush](https://www.semrush.com/)

---

## License

MIT License - Created by [Rugved](https://github.com/rugved0102)

---

## Acknowledgments

- **Groq** for fast LLM inference
- **Supabase** for backend infrastructure
- **shadcn/ui** for beautiful components
- **Xenova** for transformer models
- **Vercel** for Tailwind CSS

---

## Support

Need help?

1. **Project Repository**: [GitHub](https://github.com/rugved0102/Web-Scrapper-LLM)
2. **Groq Documentation**: [console.groq.com/docs](https://console.groq.com/docs)
3. **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
4. **Report Issues**: [GitHub Issues](https://github.com/rugved0102/Web-Scrapper-LLM/issues)

---

## Quick Start Summary

```bash
# 1. Clone the repo
git clone https://github.com/rugved0102/Web-Scrapper-LLM.git

# 2. Install dependencies
cd Web-Scrapper-LLM
npm install

# 3. Setup environment
cp .env.local.example .env.local
# Add your GROQ_API_KEY

# 4. Run the app
npm run dev

# 5. Open browser
# Navigate to http://localhost:8082

# 6. Start analyzing!
# Enter URLs → Choose purpose → Click Analyze → Get insights!
```

---

**Happy Analyzing!**

Built by [Rugved](https://github.com/rugved0102) using React, TypeScript, Supabase, and Groq AI
