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
    const { projectData, chatHistories } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Organize chat histories by source
    const krisChatHistory = chatHistories.filter((h: any) => h.source === 'KRIS').map((h: any) => h.content).join('\n');
    const scientistHistory = chatHistories.filter((h: any) => h.source === 'AI Scientist').map((h: any) => h.content).join('\n');
    const otherHistory = chatHistories.filter((h: any) => !['KRIS', 'AI Scientist'].includes(h.source)).map((h: any) => h.content).join('\n');

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
            content: `You are a technical documentation specialist creating comprehensive project documentaries. Analyze all provided information and create a professional, detailed report.

Structure your documentary with these sections:
1. EXECUTIVE SUMMARY - Overview of project goals and achievements
2. PROJECT OVERVIEW - Detailed description and specifications
3. DEVELOPMENT JOURNEY - Timeline and major milestones
4. TECHNICAL ANALYSIS - Deep dive into design decisions and implementations
5. CHAT HISTORY INSIGHTS - Key learnings from conversations
6. CHALLENGES AND SOLUTIONS - Problems faced and how they were resolved
7. FUTURE RECOMMENDATIONS - Suggestions for improvement
8. CONCLUSION - Final thoughts and summary

Use professional markdown formatting with headers, lists, and emphasis where appropriate.`
          },
          {
            role: 'user',
            content: `Create a comprehensive documentary for this project:

PROJECT INFORMATION:
Title: ${projectData.title}
Description: ${projectData.description}
Status: ${projectData.status}
Phase: ${projectData.current_phase}
Created: ${new Date(projectData.created_at).toLocaleDateString()}

KRIS CHAT HISTORY:
${krisChatHistory || 'No KRIS chat history available'}

AI SCIENTIST CONSULTATIONS:
${scientistHistory || 'No AI Scientist consultations'}

OTHER INTERACTIONS:
${otherHistory || 'No other interactions'}

Analyze all information and create a detailed, professional documentary report.`
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
    const documentary = data.choices[0].message.content;

    // Generate PDF metadata
    const pdfMetadata = {
      title: `${projectData.title} - Project Documentary`,
      author: 'KRIS Laboratory',
      subject: 'Project Documentation',
      keywords: 'engineering, robotics, project, documentary',
      creator: 'KRIS Project Management System',
      producer: 'KRIS Laboratory AI',
      creationDate: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({ 
        documentary,
        pdfMetadata,
        markdown: documentary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating documentary:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});