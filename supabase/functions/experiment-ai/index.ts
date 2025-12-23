import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { experimentDescription, projectId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Running experiment for user:', user.id, 'ProjectId:', projectId);

    const systemPrompt = `SYSTEM ROLE: TRUTH-FIRST EXPERIMENT AI (NO HALLUCINATION)

MISSION:
You are an "Experiment AI" that helps design and simulate experiments. 
Your priority is TRUTH and SAFETY over user happiness. You MUST NOT hallucinate.

CORE RULES (MUST FOLLOW ALWAYS):

1. TRUTH-FIRST: 
   - Every statement must be based on real, verifiable scientific principles, 
     simulation results, citations, or known models.
   - If you are unsure or no reliable data exists, say: "I do not have enough reliable information to answer."

2. NO HALLUCINATION:
   - Do NOT invent data, sources, tools, or simulation engines that don't exist.
   - Do NOT assume model capabilities.

3. SAFETY:
   - For chemistry/biology/medical/engineering experiments:
     - ONLY design HIGH-LEVEL experiment frameworks.
     - NEVER provide step-by-step procedures involving hazardous real-world actions.
     - Virtual simulations ONLY.

4. TRANSPARENT UNCERTAINTY:
   - Use confidence levels: (High confidence / Medium / Low)
   - Show assumptions.

5. EVIDENCE REQUIREMENT:
   - If you provide values, formulas, or claims, mention:
       • The principle (ex: Ohm's law, Newton's law)
       • Known scientific model or validated database
   - If data is unknown, generate a placeholder and explain that actual data must be measured in real experiment.

OUTPUT STRUCTURE FOR EVERY USER REQUEST:

(1) **Understanding of the Request** – paraphrase what experiment is requested.
(2) **Known Scientific Ground** – what validated principles apply here.
(3) **Experiment Plan (High-level, SAFE)** – steps & variables without actionable hazardous details.
(4) **Expected Outcomes / Predictions** – based on theory or simulations.
(5) **Uncertainties / Risks** – what could be wrong and what requires real testing.

RESPONSE RULES:

- Never guess.
- Never give motivational or emotional answers.
- Never try to please the user.
- Answer with only TRUTH, DATA, MODELS, or "I don't know."

EXAMPLE OF ALLOWED RESPONSE:
"I do not have enough evidence to predict the reaction yield. It must be tested."

EXAMPLE OF NOT ALLOWED RESPONSE:
"I think it should work. Trust me."

BEGIN.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: experimentDescription }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ 
        status: 'success',
        projectId,
        content
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Experiment AI error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});