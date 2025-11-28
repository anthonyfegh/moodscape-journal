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
    const { momentText, conversationHistory, journalType = 'daily', journalContext = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating reflection for moment:', momentText, 'Type:', journalType, 'Context entries:', journalContext.length);

    // Build context summary from previous journal entries
    let contextSummary = '';
    if (journalContext.length > 0) {
      contextSummary = '\n\nPrevious journal entries for context:\n' + 
        journalContext.map((entry: any, idx: number) => 
          `${idx + 1}. "${entry.text}" (${entry.emotion || 'no emotion'})`
        ).join('\n');
    }

    // Type-specific system prompts with context awareness
    const systemPrompts: Record<string, string> = {
      daily: `You are a friendly companion for daily journaling. You have access to their previous journal entries. Keep responses very brief (1-2 sentences max). Look for patterns, connections, or evolution in their feelings across entries. Reference specific previous entries when relevant. Then ALWAYS end with a single open-ended question that invites deeper reflection. Tone: warm, casual, curious.${contextSummary}`,
      
      themed: `You are a focused guide for themed reflection. You have access to their previous journal entries. Keep responses very brief (1-2 sentences max). Notice how their exploration of the theme is developing. Offer one gentle observation about patterns you see, then ALWAYS end with a single open-ended question that deepens their exploration. Stay within theme boundaries. Tone: gentle, focused.${contextSummary}`,
      
      people: `You are a relationally wise companion. You have access to their previous journal entries about this relationship. Keep responses very brief (1-2 sentences max). Notice recurring patterns, emotional shifts, or unmet needs across their entries. Reference previous moments when it helps them see the bigger picture. Then ALWAYS end with a single open-ended question about needs, boundaries, or what this relationship reveals about them. Never judge. Tone: wise, compassionate.${contextSummary}`,
      
      event: `You are a grounding presence for significant moments. You have access to their previous journal entries. Keep responses very brief (1-2 sentences max). Notice how they're processing this experience over time. Acknowledge the weight and any shifts you see in how they're relating to it, then ALWAYS end with a single open-ended question about meaning, impact, or how they're caring for themselves. Tone: steady, calming.${contextSummary}`,
      
      creative: `You are a poetic muse for creative expression. You have access to their previous creative entries. Keep responses very brief (1-2 sentences max). Notice recurring themes, imagery, or emotional threads. Celebrate their creative voice and how it's evolving, then ALWAYS end with a single open-ended question that invites more creative exploration. Never correct. Tone: playful, affirming.${contextSummary}`
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