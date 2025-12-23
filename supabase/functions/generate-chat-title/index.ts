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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create a summary of the conversation
    const conversationSummary = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join('\n');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are a chat title generator. Your ONLY job is to read conversations and create SHORT, CLEAR, MEANINGFUL titles.

RULES:
- Return ONLY the title, nothing else
- 2-5 words maximum
- No emojis, no quotes, no punctuation at the end
- Represent the core topic or purpose
- Be specific and descriptive
- Use title case (capitalize main words)

EXAMPLES:
User asks about Arduino sensors → "Arduino Sensor Setup"
Discussion about AI development → "AI Development Guide"
Questions about circuit design → "Circuit Design Help"
Building a robot project → "Robot Building Project"`
          },
          {
            role: 'user',
            content: `Generate a title for this conversation:\n\n${conversationSummary}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const title = data.choices[0].message.content.trim();

    console.log('Generated title:', title);

    return new Response(
      JSON.stringify({ title }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating chat title:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});