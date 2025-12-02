import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, limit = 5, threshold = 0.3 } = await req.json();
    
    if (!query || !userId) {
      throw new Error("Missing required fields: query, userId");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Recalling memories for query: "${query.substring(0, 50)}..."`);

    // Step 1: Generate embedding for the query
    const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error("Embedding API error:", errorText);
      throw new Error(`Embedding API failed: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Step 2: Search for similar memories using the database function
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: memories, error: searchError } = await supabase.rpc("search_memories", {
      query_embedding: queryEmbedding,
      match_user_id: userId,
      match_threshold: threshold,
      match_count: limit,
    });

    if (searchError) {
      console.error("Memory search error:", searchError);
      throw new Error(`Failed to search memories: ${searchError.message}`);
    }

    console.log(`Found ${memories?.length || 0} relevant memories`);

    // Step 3: Fetch the full moment text for each memory
    if (memories && memories.length > 0) {
      const momentIds = memories.map((m: any) => m.moment_id).filter(Boolean);
      
      const { data: moments, error: momentsError } = await supabase
        .from("moments")
        .select("id, text, timestamp, emotion, color")
        .in("id", momentIds);

      if (!momentsError && moments) {
        // Merge moment text with memory metadata
        const enrichedMemories = memories.map((memory: any) => {
          const moment = moments.find((m: any) => m.id === memory.moment_id);
          return {
            ...memory,
            text: moment?.text || "",
            timestamp: moment?.timestamp,
            emotion: moment?.emotion,
            color: moment?.color,
          };
        });

        return new Response(
          JSON.stringify({ memories: enrichedMemories }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ memories: memories || [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in recall-memories:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
