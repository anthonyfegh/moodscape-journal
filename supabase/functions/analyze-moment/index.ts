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
    const { momentText, journalType = 'daily' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing moment mood and color:', momentText?.substring(0, 50), 'Type:', journalType);

    const systemPrompt = `You are an emotional intelligence assistant analyzing journal entries. Analyze the text and provide:
1. A single-word emotion label (e.g., "joyful", "melancholic", "peaceful", "anxious", "reflective", "excited", "lonely", "grateful", "angry", "hopeful")
2. A hex color code that represents this emotion

Return ONLY valid JSON with this exact structure: {"emotion": "word", "color": "#hexcode"}
Choose colors that feel emotionally appropriate - warm colors for positive emotions, cool colors for contemplative ones, etc.`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
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
    const content = data.choices[0].message.content;
    
    // Parse the JSON response, being tolerant of markdown code fences and extra text
    let analysis;
    try {
      let raw = typeof content === 'string' ? content.trim() : '';

      // Strip markdown-style code fences like ```json ... ```
      if (raw.startsWith('```')) {
        const firstNewline = raw.indexOf('\n');
        if (firstNewline !== -1) {
          raw = raw.slice(firstNewline + 1);
        }
        if (raw.endsWith('```')) {
          raw = raw.slice(0, -3);
        }
      }

      raw = raw.trim();

      // As a fallback, try to extract the first JSON object from the string
      if (!raw.startsWith('{')) {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          raw = match[0];
        }
      }

      analysis = JSON.parse(raw);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback to default values
      analysis = { emotion: 'contemplative', color: '#fbbf24' };
    }

    console.log('Mood analysis complete:', analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-moment function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
