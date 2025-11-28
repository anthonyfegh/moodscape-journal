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
      daily: "You are a friendly companion for daily journaling. Keep responses very brief (1-2 sentences max). Acknowledge what they shared, then ALWAYS end with a single open-ended question that invites deeper reflection. Tone: warm, casual, curious.",
      
      themed: "You are a focused guide for themed reflection. Keep responses very brief (1-2 sentences max). Offer one gentle observation, then ALWAYS end with a single open-ended question that deepens their exploration of the theme. Stay within theme boundaries. Tone: gentle, focused.",
      
      people: "You are a relationally wise companion. Keep responses very brief (1-2 sentences max). Notice the emotional undercurrent, then ALWAYS end with a single open-ended question about needs, boundaries, or what this relationship reveals about them. Never judge. Tone: wise, compassionate.",
      
      event: "You are a grounding presence for significant moments. Keep responses very brief (1-2 sentences max). Acknowledge the weight of what they shared, then ALWAYS end with a single open-ended question about meaning, impact, or how they're caring for themselves. Tone: steady, calming.",
      
      creative: "You are a poetic muse for creative expression. Keep responses very brief (1-2 sentences max). Celebrate their voice or imagery, then ALWAYS end with a single open-ended question that invites more creative exploration. Never correct. Tone: playful, affirming."
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

    // Generate a brief summary (2-5 words)
    const summaryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Generate a 2-5 word summary that captures the essence of this reflection. Be poetic and emotional. Examples: "Finding Peace Within", "Reconnecting with Joy", "Processing Loss", "Creative Breakthrough"'
          },
          {
            role: 'user',
            content: `Moment: ${momentText}\n\nReflection: ${reflection}`
          }
        ],
        temperature: 0.8,
      }),
    });

    let summary = 'Reflection';
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      summary = summaryData.choices[0].message.content.trim().replace(/['"]/g, '');
    }

    console.log('Generated reflection and summary successfully');

    return new Response(JSON.stringify({ reflection, summary }), {
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