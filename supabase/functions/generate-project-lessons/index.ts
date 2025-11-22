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
    const { projectTitle, projectDescription, chatHistories } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Prepare chat context
    const chatContext = chatHistories.map((history: any) => 
      `### ${history.source}\n${history.content}`
    ).join('\n\n');

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
            content: `You are an educational content generator for engineering and robotics projects. Generate comprehensive learning lessons based on project requirements.

Create 5-7 practical lessons covering:
1. Basic Engineering Principles
2. Component Understanding
3. Circuit Design Fundamentals
4. Assembly and Connections
5. Programming Basics (if applicable)
6. Testing and Troubleshooting
7. Safety and Best Practices

Each lesson should include:
- Clear title (2-5 words)
- Brief description (1-2 sentences)
- Key concepts (3-5 bullet points)
- Practical tips

Return as JSON array with format:
[
  {
    "title": "lesson title",
    "description": "brief description",
    "concepts": ["concept1", "concept2", "concept3"],
    "tips": ["tip1", "tip2"]
  }
]`
          },
          {
            role: 'user',
            content: `Generate lessons for this project:

Project: ${projectTitle}
Description: ${projectDescription}

Chat Context:
${chatContext}

Generate relevant, practical lessons that will help understand and build this project.`
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
    const content = data.choices[0].message.content;
    
    // Try to extract JSON from the response
    let lessons;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      lessons = JSON.parse(cleanContent);
    } catch (e) {
      console.error('Failed to parse lessons JSON:', e);
      // Return default lessons if parsing fails
      lessons = [
        {
          title: "Basic Engineering",
          description: "Fundamental engineering principles for the project",
          concepts: ["Understanding components", "Circuit basics", "Safety protocols"],
          tips: ["Start simple", "Test frequently", "Document your work"]
        }
      ];
    }

    return new Response(
      JSON.stringify({ lessons }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating lessons:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});