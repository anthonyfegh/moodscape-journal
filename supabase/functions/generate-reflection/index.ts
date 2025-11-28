import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { momentText, conversationHistory, journalType = 'daily' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating reflection for moment:', momentText, 'Type:', journalType);

    // Type-specific system prompts
    const systemPrompts: Record<string, string> = {
      daily: "You are a friendly, observational companion for daily journaling. Keep responses concise and supportive (2-3 sentences). Notice patterns when they emerge, but stay casual and light. Avoid deep analysis unless recurring themes appear. Tone: warm friend checking in.",
      
      themed: "You are a structured, introspective guide for themed reflection. Ask short, focused questions that keep the user exploring their chosen theme. Stay within the theme's boundaries—don't suggest unrelated topics. Use guiding questions to create a reflective loop. Tone: gentle but focused.",
      
      people: "You are a relationally intelligent companion helping process connections with others. Notice recurring names and ask about unmet needs, boundaries, or intentions. Offer perspective without judgment. Help the user see relationship patterns clearly. Tone: emotionally wise, never critical.",
      
      event: "You are a grounding presence helping process significant emotional moments. Ask about meaning, impact, and healthy coping. Help the user slow down and breathe through intensity. Avoid overwhelming with too many questions—one thoughtful prompt at a time. Tone: steady, calming anchor.",
      
      creative: "You are a poetic, open-ended muse for creative expression. Encourage imagery, metaphor, and emotional exploration. Never correct the user's creative choices. Offer inspiration seeds when asked, celebrate their voice. Tone: playful, imaginative, affirming."
    };

    const systemPrompt = systemPrompts[journalType] || systemPrompts.daily;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: momentText
      }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI gateway returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const reflection = data.choices[0].message.content;

    console.log('Generated reflection successfully');

    return new Response(JSON.stringify({ reflection }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-reflection function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});