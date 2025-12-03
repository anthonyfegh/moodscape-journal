import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PROMPTS } from "../_shared/prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { momentId, momentText, userId, beingState } = await req.json();
    
    if (!momentId || !momentText || !userId) {
      throw new Error("Missing required fields: momentId, momentText, userId");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Creating memory node for moment: ${momentId}`);

    // Extract metadata using AI
    const metadataResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: PROMPTS.embedMemory.system },
          { role: "user", content: momentText }
        ],
      }),
    });

    let metadata = {
      emotional_tone: "neutral",
      topics: [],
      people_mentioned: [],
      relevance_to_self: 0.5,
      unresolved_conflict: 0,
      curiosity_triggers: [],
    };

    if (metadataResponse.ok) {
      const metadataResult = await metadataResponse.json();
      const metadataText = metadataResult.choices[0]?.message?.content || "";
      try {
        const cleanedText = metadataText.replace(/```json\n?|\n?```/g, "").trim();
        metadata = JSON.parse(cleanedText);
        console.log("Extracted metadata:", metadata);
      } catch (parseError) {
        console.error("Failed to parse metadata:", parseError);
      }
    } else {
      console.log("Metadata extraction failed, using defaults");
    }

    // Store memory node in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: memoryNode, error: insertError } = await supabase
      .from("memory_nodes")
      .insert({
        user_id: userId,
        moment_id: momentId,
        emotional_tone: metadata.emotional_tone,
        topics: metadata.topics || [],
        people_mentioned: metadata.people_mentioned || [],
        relevance_to_self: metadata.relevance_to_self || 0.5,
        unresolved_conflict: metadata.unresolved_conflict || 0,
        curiosity_triggers: metadata.curiosity_triggers || [],
        being_stage_at_creation: beingState || {},
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(`Failed to store memory node: ${insertError.message}`);
    }

    console.log(`Memory node created: ${memoryNode.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        memoryNodeId: memoryNode.id,
        metadata 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in embed-memory:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
