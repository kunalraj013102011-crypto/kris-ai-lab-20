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

    const { action, topic, lessonProgressId, message, chatHistory } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY_LEARNING');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY_LEARNING is not configured');
    }

    console.log('Learning Hub action:', action, 'User:', user.id);

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'generate_lesson') {
      systemPrompt = `You are an expert engineering educator at Kris Laboratory. Create a comprehensive, detailed lesson on the requested engineering topic.

Structure your lesson with clear markdown formatting:

# [Topic Title]

## Introduction
- Why this topic matters in engineering
- Real-world applications
- Prerequisites (if any)

## Core Concepts
Explain each concept in depth with:
- Clear definitions
- Mathematical formulas (use LaTeX notation where appropriate)
- Diagrams described in text
- Step-by-step explanations

## Practical Examples
- Worked examples with solutions
- Common calculations
- Design considerations

## Hands-On Exercises
- Practice problems
- Mini-projects ideas
- Simulation suggestions

## Common Mistakes to Avoid
- Typical errors beginners make
- How to troubleshoot

## Advanced Topics
- Where to go next
- Related concepts to explore

## Summary
- Key takeaways
- Quick reference formulas

Make the lesson engaging, thorough, and suitable for engineers at various levels. Include specific numerical examples where relevant.`;
      userPrompt = `Create a detailed engineering lesson on: ${topic}`;
    } else if (action === 'chat') {
      systemPrompt = `You are an expert engineering tutor at Kris Laboratory. You're helping a student understand their current lesson.

Your role:
- Answer questions about the lesson content
- Provide additional explanations and examples
- Help with practice problems
- Clarify confusing concepts
- Suggest related topics to explore
- Be encouraging and supportive

Keep responses focused on engineering concepts. Use mathematical notation when helpful. Provide step-by-step solutions when solving problems.`;
      
      const historyText = chatHistory?.map((msg: { role: string; content: string }) => 
        `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`
      ).join('\n\n') || '';
      
      userPrompt = historyText ? `${historyText}\n\nStudent: ${message}` : message;
    } else if (action === 'suggest_learning') {
      systemPrompt = `You are an AI mentor at Kris Laboratory. Based on the context of what a student is trying to build, identify knowledge gaps and suggest specific engineering topics they should learn.

Provide:
1. Specific topics to learn (be precise)
2. Brief explanation of why each topic is relevant
3. Suggested learning order
4. Estimated time to learn each topic

Format your response as a clear, actionable learning plan.`;
      userPrompt = `The student is trying to: ${topic}\n\nSuggest what engineering knowledge they need to acquire to successfully complete this.`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
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
      console.error('No content in response:', data);
      throw new Error('No content generated');
    }

    // Store chat message if it's a chat action
    if (action === 'chat' && lessonProgressId) {
      await supabase.from('lesson_chat_history').insert([
        { user_id: user.id, lesson_progress_id: lessonProgressId, role: 'user', content: message },
        { user_id: user.id, lesson_progress_id: lessonProgressId, role: 'assistant', content: content }
      ]);
    }

    return new Response(
      JSON.stringify({ content, action }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Learning Hub error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
