import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { getDomainTemplate } from "../_shared/domainTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  urls: string[];
  purpose: string;
  domain?: string;
}

interface SiteComparison {
  url: string;
  title: string;
  strengths: string[];
  weaknesses: string[];
  unique_features: string[];
}

interface ComparisonData {
  summary: string;
  similarities: string[];
  differences: string[];
  site_comparisons: SiteComparison[];
  winner?: string;
  winner_reasoning?: string;
}

interface InsightResponse {
  tldr: string;
  key_points: string[];
  deep_insights: string[];
  conflicts_across_sources: string[];
  opportunities_or_gaps: string[];
  recommendations: string[];
  domain_specific_insights: string[];
  comparison?: ComparisonData;
  languages?: string[];
}

// Simple text chunking function
function chunkText(text: string, chunkSize: number = 500): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  
  return chunks.filter(chunk => chunk.trim().length > 0);
}

// Detect language from HTML or content using multiple strategies
function detectLanguage(html: string, textContent: string): string {
  // Strategy 1: Check HTML lang attribute
  const htmlLangMatch = html.match(/<html[^>]+lang=["']?([a-z]{2}(-[A-Z]{2})?)/i);
  if (htmlLangMatch) {
    return htmlLangMatch[1].toLowerCase().split('-')[0]; // Return ISO 639-1 code
  }
  
  // Strategy 2: Check meta tags
  const metaLangMatch = html.match(/<meta[^>]+http-equiv=["']?content-language["']?[^>]+content=["']?([a-z]{2})/i);
  if (metaLangMatch) {
    return metaLangMatch[1].toLowerCase();
  }
  
  const metaLangMatch2 = html.match(/<meta[^>]+content=["']?([a-z]{2})["']?[^>]+http-equiv=["']?content-language/i);
  if (metaLangMatch2) {
    return metaLangMatch2[1].toLowerCase();
  }
  
  // Strategy 3: Check og:locale meta tag
  const ogLocaleMatch = html.match(/<meta[^>]+property=["']?og:locale["']?[^>]+content=["']?([a-z]{2})/i);
  if (ogLocaleMatch) {
    return ogLocaleMatch[1].toLowerCase();
  }
  
  // Strategy 4: Simple heuristic based on common words (fallback)
  const lowerContent = textContent.toLowerCase();
  
  // English indicators
  const englishWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'with', 'that', 'this'];
  const englishCount = englishWords.filter(word => lowerContent.includes(` ${word} `)).length;
  
  // Spanish indicators
  const spanishWords = ['el', 'la', 'de', 'en', 'los', 'las', 'del', 'para', 'con', 'por'];
  const spanishCount = spanishWords.filter(word => lowerContent.includes(` ${word} `)).length;
  
  // French indicators
  const frenchWords = ['le', 'la', 'les', 'de', 'et', 'des', 'dans', 'pour', 'avec', 'sur'];
  const frenchCount = frenchWords.filter(word => lowerContent.includes(` ${word} `)).length;
  
  // German indicators
  const germanWords = ['der', 'die', 'das', 'und', 'den', 'ein', 'eine', 'ist', 'mit', 'auf'];
  const germanCount = germanWords.filter(word => lowerContent.includes(` ${word} `)).length;
  
  const maxCount = Math.max(englishCount, spanishCount, frenchCount, germanCount);
  
  if (maxCount === 0) return 'en'; // Default to English if no indicators found
  
  if (englishCount === maxCount) return 'en';
  if (spanishCount === maxCount) return 'es';
  if (frenchCount === maxCount) return 'fr';
  if (germanCount === maxCount) return 'de';
  
  return 'en'; // Default
}

// Generate embeddings using Xenova transformers (better quality)
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Use Xenova/transformers for proper embeddings
    // @ts-ignore - Deno dynamic import
    const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
    
    // Cache the pipeline to avoid reloading
    if (!(globalThis as any).embeddingPipeline) {
      console.log("Loading embedding model...");
      (globalThis as any).embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    
    const pipe = (globalThis as any).embeddingPipeline;
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error("Error generating embedding with Xenova, falling back to simple:", error);
    // Fallback to simple embedding if Xenova fails
    return generateSimpleEmbedding(text);
  }
}

// Simple fallback embedding (word frequency hashing)
function generateSimpleEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  words.forEach((word) => {
    const hash = word.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    embedding[Math.abs(hash) % 384] += 1;
  });
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
}

const purposePrompts = {
  business: `You are a business intelligence analyst. Focus on:
    - Business opportunities and risks
    - Market positioning and competitive advantages
    - Revenue potential and business models
    - Strategic recommendations`,
  research: `You are an academic research analyst. Focus on:
    - Research methodologies and findings
    - Citations and references
    - Knowledge gaps and future research directions
    - Academic rigor and validity`,
  science: `You are a scientific analyst. Focus on:
    - Scientific methods and experimental design
    - Data quality and statistical significance
    - Reproducibility and peer review status
    - Theoretical frameworks`,
  competitive: `You are a competitive intelligence analyst. Focus on:
    - Competitor strengths and weaknesses
    - Market share and positioning
    - Product/service differentiation
    - Strategic moves and partnerships`,
  market: `You are a market trends analyst. Focus on:
    - Industry trends and patterns
    - Consumer behavior and preferences
    - Emerging technologies and innovations
    - Market growth projections`,
  general: `You are a comprehensive analyst. Focus on:
    - Overall content themes
    - Quality and credibility of information
    - Key takeaways and learnings
    - Practical applications`,
};

// Mock response generator for testing without API keys
function generateMockInsights(scrapedData: any[], purpose: string): InsightResponse {
  const urls = scrapedData.map(d => d.url).join(", ");
  return {
    tldr: `Mock analysis of ${scrapedData.length} website(s) with ${purpose} focus. This is a test response generated without calling an LLM API.`,
    key_points: [
      `Analyzed ${scrapedData.length} websites: ${urls}`,
      "Mock insight: Content extraction successful",
      "Mock insight: All URLs processed correctly",
      "Mock insight: Ready for real LLM analysis",
      "To enable real analysis, configure GROQ_API_KEY or LOVABLE_API_KEY",
    ],
    deep_insights: [
      "This is a mock response for testing the application flow",
      "No actual AI analysis was performed",
      "Configure LLM_PROVIDER and API keys to enable real insights",
    ],
    conflicts_across_sources: [
      "Mock mode: No real conflict analysis performed",
    ],
    opportunities_or_gaps: [
      "Opportunity: Set up Groq API for free-tier LLM access",
      "Gap: Real AI analysis not configured yet",
    ],
    recommendations: [
      "Add GROQ_API_KEY to your environment variables",
      "Visit https://console.groq.com to get a free API key",
      "Set LLM_PROVIDER=groq in your .env file",
      "Restart the edge function after configuration",
    ],
    domain_specific_insights: [
      `Mock ${purpose} analysis: Configure real LLM to see actual insights`,
    ],
  };
}

// Call LLM based on provider configuration
async function callLLM(systemPrompt: string, analysisPrompt: string): Promise<InsightResponse> {
  const LLM_PROVIDER = Deno.env.get("LLM_PROVIDER") || "groq";
  
  console.log(`Using LLM provider: ${LLM_PROVIDER}`);
  console.log(`Environment check - GROQ_API_KEY exists: ${!!Deno.env.get("GROQ_API_KEY")}`);

  if (LLM_PROVIDER === "groq") {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set in environment");
      throw new Error("GROQ_API_KEY not configured. Set it in your environment or use LLM_PROVIDER=mock for testing.");
    }

    const GROQ_API_URL = Deno.env.get("GROQ_API_URL") || "https://api.groq.com/openai/v1/chat/completions";
    const GROQ_MODEL = Deno.env.get("GROQ_MODEL") || "llama-3.1-8b-instant";

    console.log(`Calling Groq API with model: ${GROQ_MODEL}`);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: analysisPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded on Groq API. Please try again later.");
      }
      if (response.status === 401) {
        throw new Error("Invalid Groq API key. Please check your GROQ_API_KEY configuration.");
      }
      
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } 
  
  else if (LLM_PROVIDER === "lovable") {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Calling Lovable AI Gateway");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: analysisPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("Payment required. Please add credits to your workspace.");
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  }
  
  else {
    throw new Error(`Unsupported LLM_PROVIDER: ${LLM_PROVIDER}. Use 'groq', 'lovable', or 'mock'.`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header and verify user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          authorization: authHeader,
        },
      },
    });

    const token = authHeader.replace("Bearer ", "");
    let userId: string;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
    } catch (e) {
      console.error("Invalid JWT token", e);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { urls, purpose, domain }: AnalysisRequest = await req.json();
    
    if (!urls || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: "No URLs provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing ${urls.length} URLs with purpose: ${purpose}, domain: ${domain || 'general'}`);

    // Helper function to scrape with headless browser (for JS-heavy sites)
    async function scrapeWithBrowser(url: string): Promise<{ html: string; title: string } | null> {
      const BROWSERLESS_API_KEY = Deno.env.get("BROWSERLESS_API_KEY");
      
      if (!BROWSERLESS_API_KEY) {
        console.log("BROWSERLESS_API_KEY not set, skipping browser scraping");
        return null;
      }

      try {
        console.log(`Attempting browser scraping for: ${url}`);
        
        // Enhanced configuration with stealth mode to bypass anti-bot detection
        const response = await fetch(`https://chrome.browserless.io/content?token=${BROWSERLESS_API_KEY}&stealth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: url,
            waitFor: 5000, // Wait 5 seconds for full page load
            gotoOptions: {
              waitUntil: "networkidle0", // Wait for no network activity
              timeout: 45000,
            },
            // Stealth mode headers to avoid detection
            setExtraHTTPHeaders: {
              "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
              "Accept-Encoding": "gzip, deflate, br",
              "Cache-Control": "max-age=0",
              "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
              "Sec-Fetch-Dest": "document",
              "Sec-Fetch-Mode": "navigate",
              "Sec-Fetch-Site": "none",
              "Sec-Fetch-User": "?1",
              "Upgrade-Insecure-Requests": "1",
            },
            // Realistic viewport and device emulation
            viewport: {
              width: 1920,
              height: 1080,
              deviceScaleFactor: 1,
            },
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            // Add cookies and other realistic browser behavior
            addScriptTag: [{
              content: `
                Object.defineProperty(navigator, 'webdriver', {get: () => false});
                Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
                Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});
              `
            }],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Browserless failed for ${url}: ${response.status}`, errorText);
          return null;
        }

        const html = await response.text();
        
        // Extract title from rendered HTML
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
        
        console.log(`Successfully scraped ${url} with browser (${html.length} chars)`);
        return { html, title };
      } catch (error) {
        console.error(`Browser scraping error for ${url}:`, error);
        return null;
      }
    }

    // Scrape all websites
    const scrapedData: { url: string; content: string; title: string; language: string }[] = [];
    
    for (const url of urls) {
      try {
        console.log(`Fetching: ${url}`);
        
        let html = "";
        let pageTitle = "";
        let usedBrowser = false;

        // Try browser scraping first for known JS-heavy domains
        const jsHeavyDomains = [
          "reddit.com", 
          "twitter.com", 
          "x.com", 
          "instagram.com", 
          "facebook.com",
          "vercel.app", // Next.js/React apps on Vercel
          "netlify.app", // React/Vue apps on Netlify
          "sciencedirect.com", // Academic publisher with anti-bot protection
        ];
        const shouldUseBrowser = jsHeavyDomains.some(domain => url.includes(domain));

        if (shouldUseBrowser) {
          console.log(`Detected JS-heavy site, trying browser scraping first...`);
          const browserResult = await scrapeWithBrowser(url);
          
          if (browserResult) {
            html = browserResult.html;
            pageTitle = browserResult.title;
            usedBrowser = true;
          } else {
            console.log(`Browser scraping failed, falling back to HTTP fetch...`);
          }
        }

        // Fallback to regular HTTP fetch if browser not used or failed
        if (!usedBrowser) {
          const response = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
              "Accept-Encoding": "gzip, deflate, br",
              "DNT": "1",
              "Connection": "keep-alive",
              "Upgrade-Insecure-Requests": "1",
            },
          });
          
          if (!response.ok) {
            console.error(`Failed to fetch ${url}: ${response.status}`);
            
            // Try browser as last resort for 403/401 errors
            if ((response.status === 403 || response.status === 401) && !shouldUseBrowser) {
              console.log(`Got ${response.status}, attempting browser scraping as fallback...`);
              const browserResult = await scrapeWithBrowser(url);
              
              if (browserResult) {
                html = browserResult.html;
                pageTitle = browserResult.title;
                usedBrowser = true;
              } else {
                scrapedData.push({
                  url,
                  content: `Failed to fetch website (Status: ${response.status}). This might be due to access restrictions, rate limiting, or the site blocking automated requests. Consider enabling browser scraping with BROWSERLESS_API_KEY for better results.`,
                  title: `Error fetching ${new URL(url).hostname}`,
                  language: 'unknown',
                });
                continue;
              }
            } else {
              scrapedData.push({
                url,
                content: `Failed to fetch website (Status: ${response.status}). This might be due to access restrictions, rate limiting, or the site blocking automated requests.`,
                title: `Error fetching ${new URL(url).hostname}`,
                language: 'unknown',
              });
              continue;
            }
          }
          
          if (!usedBrowser) {
            html = await response.text();
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            pageTitle = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
          }
        }

        // Improved content extraction
        let textContent = html
          // Remove scripts, styles, and other non-content tags
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
          .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
          .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
          // Extract text from common content tags
          .replace(/<(p|h[1-6]|li|td|th|blockquote|article|section)[^>]*>([^<]+)<\/\1>/gi, " $2 ")
          // Remove remaining HTML tags
          .replace(/<[^>]+>/g, " ")
          // Clean up entities and whitespace
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#\d+;/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // Check if we got meaningful content
        if (textContent.length < 200) {
          console.warn(`Low content extracted from ${url} (${textContent.length} chars). Likely a JavaScript-heavy site.`);
          
          // For JS-heavy sites, try to extract any visible text more aggressively
          textContent = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          
          if (textContent.length < 200) {
            textContent = `Limited content extracted from ${url}. This website may require JavaScript to display its content, which cannot be executed in this scraper. Consider using sites with static HTML content for best results. Extracted title: "${pageTitle}"`;
          }
        }

        // Limit content length but keep it reasonable
        const finalContent = textContent.slice(0, 10000);
        
        // Detect language
        const detectedLanguage = detectLanguage(html, textContent);
        
        console.log(`Extracted ${finalContent.length} characters from ${url} ${usedBrowser ? '(via browser)' : '(via HTTP)'} [Language: ${detectedLanguage}]`);

        scrapedData.push({
          url,
          content: finalContent,
          title: pageTitle,
          language: detectedLanguage,
        });
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        scrapedData.push({
          url,
          content: `Error occurred while scraping: ${errorMessage}. The website may be blocking automated requests or may have connectivity issues.`,
          title: `Error: ${new URL(url).hostname}`,
          language: 'unknown',
        });
      }
    }

    if (scrapedData.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to scrape any websites. All URLs either failed to load or returned no content.",
          details: "This can happen if the websites block automated requests or require JavaScript to render content."
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully scraped ${scrapedData.length} out of ${urls.length} URLs`);

    // Prepare content for AI analysis
    const consolidatedContent = scrapedData
      .map((data) => `\n### ${data.title}\nURL: ${data.url}\n\n${data.content}`)
      .join("\n\n---\n");

    // Get domain-specific prompts
    const domainTemplate = getDomainTemplate(domain || 'general');
    
    const systemPrompt = purposePrompts[purpose as keyof typeof purposePrompts] || purposePrompts.general;

    const analysisPrompt = `${systemPrompt}

You are analyzing content from ${scrapedData.length} website(s) with domain type: ${domainTemplate.name}.

Domain-Specific Extraction Guide:
${domainTemplate.extractionPrompt}

Domain-Specific Analysis Focus:
${domainTemplate.analysisPrompt}

Base ALL insights strictly on the provided content. Never create information not present.

${consolidatedContent}

Output in JSON format:
{
  "tldr": "One clear sentence summarizing everything",
  "key_points": ["5-7 most important points"],
  "deep_insights": ["3-5 non-obvious patterns or insights"],
  "conflicts_across_sources": ["Any contradictions between sources"],
  "opportunities_or_gaps": ["Missing information or opportunities identified"],
  "recommendations": ["3-5 actionable recommendations"],
  "domain_specific_insights": ["Insights specific to ${domainTemplate.name} domain and ${purpose} analysis"]
}`;

    const LLM_PROVIDER = Deno.env.get("LLM_PROVIDER") || "groq";
    let insights: InsightResponse;

    // Check if we should use mock mode
    if (LLM_PROVIDER === "mock") {
      console.log("Using mock mode - no LLM API calls");
      insights = generateMockInsights(scrapedData, purpose);
    } else {
      // Try to call LLM, fallback to mock on error
      try {
        insights = await callLLM(systemPrompt, analysisPrompt);
      } catch (error) {
        console.error("LLM call failed, using mock mode:", error);
        // Return mock insights with error info
        insights = generateMockInsights(scrapedData, purpose);
        const errorMessage = error instanceof Error ? error.message : String(error);
        insights.recommendations.unshift(`Error occurred: ${errorMessage}`);
      }
    }

    // Generate comparison if multiple URLs
    if (scrapedData.length > 1) {
      console.log(`Generating comparison for ${scrapedData.length} sites...`);
      try {
        const comparisonPrompt = `${systemPrompt}

You are comparing ${scrapedData.length} different websites. Analyze the content and provide a structured comparison.

${consolidatedContent}

Generate a detailed comparison in JSON format:
{
  "summary": "One sentence overview of the comparison",
  "similarities": ["Common themes, features, or approaches across all sites"],
  "differences": ["Key differences in content, quality, approach, or focus"],
  "site_comparisons": [
    {
      "url": "full URL",
      "title": "site title from content above",
      "strengths": ["What this site does better than others"],
      "weaknesses": ["Where this site falls short compared to others"],
      "unique_features": ["What makes this site stand out or unique"]
    }
  ],
  "winner": "URL of the best overall site (optional)",
  "winner_reasoning": "Explanation of why this site is recommended (if winner specified)"
}`;

        if (LLM_PROVIDER === "mock") {
          insights.comparison = {
            summary: `Mock comparison of ${scrapedData.length} websites`,
            similarities: ["All sites provide information on the topic"],
            differences: ["Sites differ in depth and presentation style"],
            site_comparisons: scrapedData.map(s => ({
              url: s.url,
              title: s.title,
              strengths: ["Mock strength"],
              weaknesses: ["Mock weakness"],
              unique_features: ["Mock unique feature"]
            })),
            winner: scrapedData[0].url,
            winner_reasoning: "Mock winner selection"
          };
        } else {
          const comparison = await callLLM(systemPrompt, comparisonPrompt);
          insights.comparison = comparison as any;
        }
        console.log("Comparison generated successfully");
      } catch (error) {
        console.error("Failed to generate comparison:", error);
        // Don't fail the whole request if comparison fails
      }
    }

    console.log("Analysis complete");

    // Generate unique analysis ID
    const analysisId = crypto.randomUUID();

    // Save content and generate embeddings in background (don't await to speed up response)
    (async () => {
      try {
        console.log("Saving content to database...");
        
        for (const scraped of scrapedData) {
          // Skip saving if content is an error message
          if (scraped.content.includes("Failed to fetch website") || scraped.content.includes("Error occurred while scraping")) {
            console.log(`Skipping save for ${scraped.url} - error content`);
            continue;
          }

          // Skip if content is too short (likely failed scrape)
          if (scraped.content.length < 200) {
            console.log(`Skipping save for ${scraped.url} - content too short (${scraped.content.length} chars)`);
            continue;
          }

          // Save content
          const { data: contentData, error: contentError } = await supabase
            .from("analysis_content")
            .insert({
              user_id: userId,
              analysis_id: analysisId,
              url: scraped.url,
              content: scraped.content,
              language: scraped.language,
            })
            .select()
            .single();

          if (contentError) {
            console.error("Error saving content:", contentError);
            continue;
          }

          console.log(`Content saved for ${scraped.url}, generating embeddings...`);

          // Generate embeddings inline instead of calling another function
          try {
            const chunks = chunkText(scraped.content, 500);
            console.log(`Generated ${chunks.length} chunks for ${scraped.url}`);

            const embeddingsToInsert = [];
            for (let i = 0; i < chunks.length; i++) {
              const chunk = chunks[i];
              const embedding = await generateEmbedding(chunk);
              
              embeddingsToInsert.push({
                analysis_content_id: contentData.id,
                chunk_text: chunk,
                chunk_index: i,
                embedding,
              });
            }

            const { error: insertError } = await supabase
              .from("content_embeddings")
              .insert(embeddingsToInsert);

            if (insertError) {
              console.error("Error inserting embeddings:", insertError);
            } else {
              console.log(`Successfully saved ${embeddingsToInsert.length} embeddings for ${scraped.url}`);
            }
          } catch (embError) {
            console.error("Error generating embeddings:", embError);
          }
        }
      } catch (error) {
        console.error("Error in background content save:", error);
      }
    })();

    // Extract unique languages from scraped data
    const languages = [...new Set(scrapedData.map(s => s.language).filter(l => l !== 'unknown'))];
    
    // Add languages to insights
    if (languages.length > 0) {
      insights.languages = languages;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        insights,
        analysisId,
        analyzed_urls: scrapedData.length,
        provider: LLM_PROVIDER,
        languages,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in analyze-websites:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
