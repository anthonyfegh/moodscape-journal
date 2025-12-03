import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PROMPTS } from "../_shared/prompts.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Moment {
  text: string;
  emotion: string;
  color: string;
  timestamp: string;
}

interface BeingState {
  K: number;
  V: number;
  A: number;
  H: number;
  I: number;
  C: number;
  U: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      allJournalsMoments,
      currentJournalMoments,
      currentText,
      journalType,
      weeklyJournalFrequency,
      currentBeingState,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from all journals for baseline
    const allMomentsContext = (allJournalsMoments || [])
      .slice(-30)
      .map((m: Moment) => `[${m.emotion}] ${m.text}`)
      .join('\n');

    // Current journal context (more weight)
    const currentJournalContext = (currentJournalMoments || [])
      .slice(-10)
      .map((m: Moment) => `[${m.emotion}] ${m.text}`)
      .join('\n');

    // Calculate base entropy from weekly frequency
    const weeklyFreq = weeklyJournalFrequency ?? 0;
    const baseEntropyFromFrequency = weeklyFreq <= 1 ? 0.8 : weeklyFreq <= 3 ? 0.5 : weeklyFreq <= 5 ? 0.3 : 0.15;
    
    // Build current state context if provided (for moment hover analysis)
    const currentStateContext = currentBeingState 
      ? `\n\nThe being's current state (for reference, blend this with your analysis):
K=${currentBeingState.K?.toFixed(2)}, V=${currentBeingState.V?.toFixed(2)}, A=${currentBeingState.A?.toFixed(2)}, 
H=${currentBeingState.H?.toFixed(2)}, I=${currentBeingState.I?.toFixed(2)}, C=${currentBeingState.C?.toFixed(2)}, U=${currentBeingState.U?.toFixed(2)}`
      : '';
    
    // Build dynamic system prompt with entropy context
    const systemPrompt = PROMPTS.analyzeBeingState.system + `

For Entropy (H), START from the base value ${baseEntropyFromFrequency.toFixed(2)} (user journaled ${weeklyFreq}/7 days this week) and adjust based on content chaos/conflict.${currentStateContext}`;

    const userPrompt = `Historical journal context (baseline):
${allMomentsContext || 'No historical data yet'}

Current journal moments (higher weight):
${currentJournalContext || 'No moments in current journal yet'}

Currently being typed (highest weight):
${currentText || 'Nothing being typed currently'}

Journal type: ${journalType || 'general'}

Based on this content, determine the being's internal state values.`;

    console.log('Analyzing being state for journal type:', journalType);

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ 
          error: "Rate limits exceeded",
          beingState: getDefaultState()
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ 
        error: "AI analysis failed",
        beingState: getDefaultState()
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log('AI response:', content);

    let beingState: BeingState;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        beingState = JSON.parse(jsonMatch[0]);
        beingState = {
          K: clamp(beingState.K ?? 0.5, 0, 1),
          V: clamp(beingState.V ?? 0, -1, 1),
          A: clamp(beingState.A ?? 0.3, 0, 1),
          H: clamp(beingState.H ?? 0.4, 0, 1),
          I: clamp(beingState.I ?? 0.5, 0, 1),
          C: clamp(beingState.C ?? 0.6, 0, 1),
          U: clamp(beingState.U ?? 0.3, 0, 1),
        };
      } else {
        console.error('Could not find JSON in response');
        beingState = getDefaultState();
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      beingState = getDefaultState();
    }

    console.log('Final being state:', beingState);

    return new Response(JSON.stringify({ beingState }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-being-state:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      beingState: getDefaultState()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getDefaultState(): BeingState {
  return {
    K: 0.5,
    V: 0.0,
    A: 0.3,
    H: 0.4,
    I: 0.5,
    C: 0.6,
    U: 0.3,
  };
}
