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
    const { query, userId, limit = 5 } = await req.json();
    
    if (!query || !userId) {
      throw new Error("Missing required fields: query, userId");
    }

    console.log(`Recalling memories for query: "${query.substring(0, 50)}..."`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // For now, use keyword-based recall since embedding API isn't available
    // Fetch recent memory nodes with their moment text
    const { data: memories, error: searchError } = await supabase
      .from("memory_nodes")
      .select(`
        id,
        moment_id,
        emotional_tone,
        topics,
        people_mentioned,
        relevance_to_self,
        moments (
          id,
          text,
          timestamp,
          emotion,
          color
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (searchError) {
      console.error("Memory search error:", searchError);
      throw new Error(`Failed to search memories: ${searchError.message}`);
    }

    // Transform and enrich the memories
    const enrichedMemories = (memories || []).map((memory: any) => ({
      id: memory.id,
      moment_id: memory.moment_id,
      emotional_tone: memory.emotional_tone,
      topics: memory.topics,
      people_mentioned: memory.people_mentioned,
      relevance_to_self: memory.relevance_to_self,
      text: memory.moments?.text || "",
      timestamp: memory.moments?.timestamp,
      emotion: memory.moments?.emotion,
      color: memory.moments?.color,
    }));

    console.log(`Found ${enrichedMemories.length} memories`);

    return new Response(
      JSON.stringify({ memories: enrichedMemories }),
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
