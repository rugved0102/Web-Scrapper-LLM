import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmbeddingRequest {
  analysisId: string;
  contentId: string;
  content: string;
  url: string;
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

// Generate embeddings using a simple TF-IDF approach (fallback for Deno)
async function generateSimpleEmbedding(text: string): Promise<number[]> {
  // Simple word frequency based embedding (384 dimensions)
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  words.forEach((word, idx) => {
    const hash = word.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    embedding[Math.abs(hash) % 384] += 1;
  });
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
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

    const accessToken = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { contentId, content }: EmbeddingRequest = await req.json();

    if (!contentId || !content) {
      return new Response(
        JSON.stringify({ error: "Missing contentId or content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating embeddings for content ${contentId}`);

    // Chunk the content
    const chunks = chunkText(content, 500);
    console.log(`Generated ${chunks.length} chunks`);

    // Generate embeddings for each chunk
    const embeddingsToInsert = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateSimpleEmbedding(chunk);
      
      embeddingsToInsert.push({
        analysis_content_id: contentId,
        chunk_text: chunk,
        chunk_index: i,
        embedding,
      });
    }

    // Insert embeddings
    const { error: insertError } = await supabase
      .from("content_embeddings")
      .insert(embeddingsToInsert);

    if (insertError) {
      console.error("Error inserting embeddings:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save embeddings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully saved ${embeddingsToInsert.length} embeddings`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunksProcessed: chunks.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-embeddings function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
