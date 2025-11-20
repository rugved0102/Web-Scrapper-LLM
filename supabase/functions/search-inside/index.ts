import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  analysisId: string;
  query: string;
}

interface SearchResult {
  answer: string;
  sources: {
    url: string;
    chunk: string;
    similarity: number;
    chunkId?: string;
    confidence: number;
  }[];
  citedSources?: number[];
}

// Simple text chunking function
function chunkText(text: string, chunkSize: number = 500): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  
  return chunks;
}

// Generate embeddings using a simple TF-IDF approach (fallback for Deno)
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

// Cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      console.error("Invalid JWT token in search-inside", e);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { analysisId, query }: SearchRequest = await req.json();

    if (!analysisId || !query) {
      return new Response(
        JSON.stringify({ error: "Missing analysisId or query" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Searching in analysis ${analysisId} for: "${query}"`);

    // Get analysis content
    const { data: contentData, error: contentError } = await supabase
      .from("analysis_content")
      .select("id, url, content")
      .eq("analysis_id", analysisId)
      .eq("user_id", userId);

    if (contentError || !contentData || contentData.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No content found for this analysis. Make sure you've analyzed the website first." 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate query embedding using the proper model
    const queryEmbedding = await generateEmbedding(query);

    // Get all embeddings for this analysis
    const contentIds = contentData.map(c => c.id);
    const { data: embeddings, error: embError } = await supabase
      .from("content_embeddings")
      .select("id, chunk_text, embedding, analysis_content_id")
      .in("analysis_content_id", contentIds);

    if (embError || !embeddings || embeddings.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No embeddings found. The content may still be processing." 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate similarities and get top chunks
    const rankedChunks = embeddings
      .map(emb => {
        const content = contentData.find(c => c.id === emb.analysis_content_id);
        const similarity = cosineSimilarity(queryEmbedding, emb.embedding as number[]);
        return {
          chunkId: emb.id,
          chunk: emb.chunk_text,
          url: content?.url || "",
          similarity,
          confidence: Math.round(similarity * 100),
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    // Prepare context for LLM with citation markers
    const context = rankedChunks
      .map((chunk, idx) => `[Source ${idx + 1} - ${chunk.url} (Confidence: ${chunk.confidence}%)]\n${chunk.chunk}`)
      .join("\n\n---\n\n");

    // Call Groq for answer generation
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that answers questions based strictly on the provided website content. 
Only use information from the context provided. If the answer is not in the context, say so.
Be concise and ALWAYS cite your sources using [1], [2], [3] etc. inline where you use information from each source.
Example: "The product costs $99 [1] and includes free shipping [2]."`,
          },
          {
            role: "user",
            content: `Context from website(s):\n\n${context}\n\nQuestion: ${query}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate answer" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groqData = await groqResponse.json();
    const answer = groqData.choices[0]?.message?.content || "No answer generated";

    // Extract which sources were cited in the answer
    const citedSources: number[] = [];
    for (let i = 1; i <= rankedChunks.length; i++) {
      if (answer.includes(`[${i}]`)) {
        citedSources.push(i);
      }
    }

    const result: SearchResult = {
      answer,
      sources: rankedChunks.map(chunk => ({
        chunkId: chunk.chunkId,
        url: chunk.url,
        chunk: chunk.chunk.slice(0, 300) + "...",
        similarity: Math.round(chunk.similarity * 100) / 100,
        confidence: chunk.confidence,
      })),
      citedSources: citedSources.length > 0 ? citedSources : undefined,
    };

    console.log("Search complete");

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in search-inside function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
