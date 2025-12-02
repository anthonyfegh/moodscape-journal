import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  K: number; // Knowledge (0–1)
  V: number; // Valence (-1–1)
  A: number; // Arousal (0–1)
  H: number; // Entropy (0–1)
  I: number; // Integration (0–1)
  C: number; // Curiosity (0–1)
  U: number; // Attachment (0–1)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      allJournalsMoments, // Array of moments from all journals (for baseline)
      currentJournalMoments, // Array of moments from current journal
      currentText, // Current text being typed
      journalType 
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from all journals for baseline
    const allMomentsContext = (allJournalsMoments || [])
      .slice(-30) // Last 30 moments across all journals
      .map((m: Moment) => `[${m.emotion}] ${m.text}`)
      .join('\n');

    // Current journal context (more weight)
    const currentJournalContext = (currentJournalMoments || [])
      .slice(-10) // Last 10 moments from current journal
      .map((m: Moment) => `[${m.emotion}] ${m.text}`)
      .join('\n');

    const systemPrompt = `You are analyzing a user's journaling to determine the internal state of a conscious being that represents their emotional landscape.

The being has 7 internal state variables:
- K (Knowledge): 0-1, represents accumulated wisdom and understanding from reflection
- V (Valence): -1 to 1, emotional tone (-1 = very negative, 0 = neutral, 1 = very positive)
- A (Arousal): 0-1, energy level and activation (0 = calm/low energy, 1 = high energy/intensity)
- H (Entropy): 0-1, internal chaos/disorder (0 = ordered/stable, 1 = chaotic/turbulent)
- I (Integration): 0-1, coherence and self-connection (0 = fragmented, 1 = integrated/whole)
- C (Curiosity): 0-1, openness to exploration and new ideas
- U (Attachment): 0-1, connection/bonding to others or ideas mentioned

Analyze the journal content and determine appropriate values. Consider:
- Historical patterns establish a baseline
- Current journal and current typing have MORE influence (3x weight)
- Emotional words, themes, and patterns
- The journal type: ${journalType || 'general'}

Respond ONLY with a JSON object containing the 7 values. Example:
{"K": 0.5, "V": 0.2, "A": 0.6, "H": 0.3, "I": 0.7, "C": 0.8, "U": 0.4}`;

    const userPrompt = `Historical journal context (baseline):
${allMomentsContext || 'No historical data yet'}

Current journal moments (higher weight):
${currentJournalContext || 'No moments in current journal yet'}

Currently being typed (highest weight):
${currentText || 'Nothing being typed currently'}

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
          status: 200, // Return 200 with default state
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

    // Parse the JSON response
    let beingState: BeingState;
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        beingState = JSON.parse(jsonMatch[0]);
        // Validate and clamp values
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
