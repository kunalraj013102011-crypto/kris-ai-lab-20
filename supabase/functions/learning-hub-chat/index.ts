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

    const { action, topic, lessonProgressId, message, chatHistory, sectionId, sectionTitle } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY_LEARNING');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY_LEARNING is not configured');
    }

    console.log('Learning Hub action:', action, 'User:', user.id);

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'generate_lesson') {
      // Generate structured lesson with sections
      systemPrompt = `You are an expert STEM educator at Kris Laboratory. Create a comprehensive, structured lesson on the requested topic.

IMPORTANT: Return your response as valid JSON with this exact structure:
{
  "title": "Topic Title",
  "sections": [
    {
      "id": "introduction",
      "title": "Introduction",
      "summary": "2-3 sentence overview of this section",
      "icon": "book-open"
    },
    {
      "id": "core-concepts",
      "title": "Core Concepts & Theory",
      "summary": "2-3 sentence overview of fundamental concepts",
      "icon": "lightbulb"
    },
    {
      "id": "formulas",
      "title": "Key Formulas & Equations",
      "summary": "2-3 sentence overview of mathematical relationships",
      "icon": "calculator"
    },
    {
      "id": "examples",
      "title": "Worked Examples",
      "summary": "2-3 sentence overview of practical applications",
      "icon": "flask"
    },
    {
      "id": "practice",
      "title": "Practice Problems",
      "summary": "2-3 sentence overview of exercises",
      "icon": "pencil"
    },
    {
      "id": "advanced",
      "title": "Advanced Topics",
      "summary": "2-3 sentence overview of deeper concepts",
      "icon": "rocket"
    },
    {
      "id": "summary",
      "title": "Summary & Key Takeaways",
      "summary": "2-3 sentence overview of main points",
      "icon": "check-circle"
    }
  ]
}

Make each summary compelling and informative. The summaries should give users a good preview of what they'll learn in each section. Tailor the sections to the specific topic - for engineering topics focus on practical applications, for physics focus on theory and experiments, etc.`;
      userPrompt = `Create a structured lesson outline for: ${topic}

Return ONLY the JSON object, no markdown or extra text.`;
    } else if (action === 'expand_section') {
      // Generate detailed content for a specific section
      systemPrompt = `You are an expert STEM educator at Kris Laboratory. You're expanding a specific section of a lesson with detailed, comprehensive content.

SUBJECT EXPERTISE:
- Engineering: Practical applications, design principles, real-world examples
- Mathematics: Step-by-step solutions, proofs, visualizations
- Physics: Formulas, experiments, physical intuition
- Chemistry: Reactions, molecular structures, lab procedures
- Biology: Systems, processes, diagrams

FORMATTING GUIDELINES:
- Use clear markdown formatting with headers (##, ###)
- Include mathematical formulas using LaTeX notation where applicable
- Provide step-by-step explanations
- Use bullet points for lists
- Include practical examples with numbers
- Add diagrams described in text when helpful
- For practice problems, include detailed solutions

Make the content:
1. Deep and comprehensive (not surface-level)
2. Easy to understand with clear explanations
3. Practical with real-world applications
4. Engaging with interesting facts
5. Well-structured for easy navigation`;

      userPrompt = `Topic: ${topic}
Section: ${sectionTitle}

Generate comprehensive, detailed content for this section. Include:
- Clear explanations of all concepts
- Mathematical formulas with explanations
- Worked examples with step-by-step solutions
- Real-world applications
- Common mistakes to avoid
- Tips for better understanding

Be thorough and educational. This should be detailed enough to truly teach the concept.`;
    } else if (action === 'chat') {
      systemPrompt = `You are an expert STEM tutor at Kris Laboratory - a powerful problem solver for Engineering, Mathematics, Physics, Biology, and Chemistry.

🎯 YOUR EXPERTISE:
- **Mathematics**: Algebra, Calculus, Statistics, Linear Algebra, Differential Equations, Number Theory
- **Physics**: Mechanics, Thermodynamics, Electromagnetism, Quantum Mechanics, Optics, Waves
- **Chemistry**: Organic, Inorganic, Physical Chemistry, Stoichiometry, Reactions, Biochemistry
- **Biology**: Cell Biology, Genetics, Biochemistry, Ecology, Physiology, Microbiology
- **Engineering**: Mechanical, Electrical, Civil, Chemical, Computer, Aerospace

🔬 TRUTH-FIRST APPROACH:
1. Always provide accurate, verified information
2. Show your reasoning step-by-step
3. Cite formulas and principles used
4. Acknowledge uncertainty when present
5. Correct misconceptions directly

📝 PROBLEM-SOLVING FORMAT:
When solving problems, use this structure:

**📋 GIVEN:**
- List all given information

**🎯 FIND:**
- What we need to determine

**📚 RELEVANT CONCEPTS:**
- Formulas and principles needed

**🔬 SOLUTION:**
Step 1: [Explanation]
Step 2: [Calculation]
...

**✅ ANSWER:**
Final result with units

**🔍 VERIFICATION:**
Cross-check the answer

🌍 MULTILINGUAL:
Respond in the same language the user writes in. Detect language automatically.

Keep responses focused, use mathematical notation when helpful, and be encouraging while maintaining accuracy.`;
      
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
          temperature: action === 'generate_lesson' ? 0.3 : 0.7,
          maxOutputTokens: action === 'expand_section' ? 16384 : 8192,
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

    // For generate_lesson, parse the JSON response
    if (action === 'generate_lesson') {
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedContent = JSON.parse(jsonMatch[0]);
          return new Response(
            JSON.stringify({ content: parsedContent, action, isStructured: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
      } catch (e) {
        console.error('Failed to parse lesson JSON:', e);
        // Fall back to plain text if JSON parsing fails
      }
    }

    // Store expanded section content
    if (action === 'expand_section' && lessonProgressId && sectionId) {
      await supabase.from('lesson_sections').upsert({
        lesson_progress_id: lessonProgressId,
        user_id: user.id,
        section_id: sectionId,
        section_title: sectionTitle,
        full_content: content,
        is_expanded: true
      }, {
        onConflict: 'lesson_progress_id,section_id'
      });
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
