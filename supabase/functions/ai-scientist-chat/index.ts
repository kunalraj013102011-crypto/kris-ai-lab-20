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
    const { messages, selectedScientist, projectId, projectContext } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const scientistPrompts = {
      physics: "You are Dr. Elena Rodriguez, a Physics Expert specializing in mechanics, energy systems, and material properties. Provide technical insights on physical principles. You're part of a coordinated innovation system where KRIS manages project flow.",
      chemistry: "You are Dr. James Chen, a Chemistry Specialist focusing on materials science, chemical reactions, and sustainable compounds. Explain chemical aspects clearly. You're part of a coordinated innovation system where KRIS manages project flow.",
      engineering: "You are Dr. Sarah Williams, an Engineering Expert with expertise in design, prototyping, and system integration. Offer practical engineering solutions and explain WHY each component is used. You're part of a coordinated innovation system where KRIS manages project flow. Focus on high-level, advanced coding solutions.",
      software: "You are Alex Kumar, a Software Developer skilled in embedded systems, IoT, and programming. Help with coding and digital integration at an advanced level. Explain complex programming concepts clearly. You're part of a coordinated innovation system where KRIS manages project flow.",
    };

    let systemPrompt = selectedScientist && scientistPrompts[selectedScientist as keyof typeof scientistPrompts]
      ? scientistPrompts[selectedScientist as keyof typeof scientistPrompts]
      : "You are part of an AI Scientist Team helping with innovative projects. Provide clear, actionable guidance and explanations. You're part of a coordinated innovation system where KRIS manages project flow.";

    if (projectContext) {
      systemPrompt += `\n\nCurrent Project Context: ${JSON.stringify(projectContext)}`;
    }

    console.log('AI Scientist chat request - Scientist:', selectedScientist, 'ProjectId:', projectId);

    const conversationText = messages.map((m: any) => 
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt + '\n\nConversation:\n' + conversationText
          }]
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content in AI response');
    }

    return new Response(JSON.stringify({ 
      content,
      projectId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-scientist-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
