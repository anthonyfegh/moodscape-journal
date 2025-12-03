import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PROMPTS } from "../_shared/prompts.ts";

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

    // Get type-specific base prompt
    const { system: basePrompt } = PROMPTS.generateReflection(journalType);
    const systemPrompt = basePrompt + contextSummary;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: momentText }
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

    // Generate a brief summary
    const summaryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: PROMPTS.reflectionSummary.system },
          { role: 'user', content: `Moment: ${momentText}\n\nReflection: ${reflection}` }
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
