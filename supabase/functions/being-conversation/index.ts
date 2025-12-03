import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PROMPTS, formatBeingState } from "../_shared/prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, conversationHistory, beingState, recalledMemories } = await req.json();
    
    if (!message || !userId) {
      throw new Error("Missing required fields: message, userId");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Being conversation - user message: "${message.substring(0, 50)}..."`);

    // Build context from recalled memories
    let memoryContext = "";
    if (recalledMemories && recalledMemories.length > 0) {
      memoryContext = "You remember these moments from their journal:\n" +
        recalledMemories.map((m: any, i: number) => {
          const date = m.timestamp ? new Date(m.timestamp).toLocaleDateString() : "unknown date";
          return `[${date}, feeling: ${m.emotional_tone || m.emotion || "unknown"}]\n"${m.text}"`;
        }).join("\n\n");
    }

    // Build conversation history context
    let historyContext = "";
    if (conversationHistory && conversationHistory.length > 0) {
      historyContext = "Recent conversation:\n" + conversationHistory.slice(-10).map((msg: any) => 
        `${msg.role === "user" ? "Human" : "Being"}: ${msg.content}`
      ).join("\n");
    }

    // Being state context
    const stateContext = beingState ? formatBeingState(beingState) : "";

    // Get the prompt from centralized prompts
    const { system: systemPrompt } = PROMPTS.beingConversation(memoryContext, historyContext, stateContext);

    // Generate response with streaming
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
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Return streaming response
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Error in being-conversation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
