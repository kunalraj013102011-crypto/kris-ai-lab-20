import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    // Verify authentication
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

    const userId = user.id;
    const { messages, files = [], currentProject = null } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    
    console.log('KRIS Chat request received for user:', userId);
    console.log('Messages count:', messages?.length || 0);
    console.log('Files count:', files?.length || 0);
    console.log('Files received:', files.map((f: any) => ({ name: f.name, type: f.type })));

    if (!GEMINI_API_KEY) {
      console.error('CRITICAL: GEMINI_API_KEY is not set');
      return new Response(JSON.stringify({ 
        error: 'Gemini API is not configured.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user's memory
    const { data: memories } = await supabase
      .from('user_memory')
      .select('*')
      .eq('user_id', userId);

    // Build memory context
    let memoryContext = '';
    if (memories && memories.length > 0) {
      memoryContext = '\n\nUser Information (from memory):\n' + 
        memories.map(m => `- ${m.memory_key}: ${m.memory_value}`).join('\n');
    }

    // Get the last user message for context detection
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // Check for creator authentication phrase in this conversation
    const isCreatorAuthenticated = messages.some((msg: any) => 
      msg.role === 'user' && msg.content.toUpperCase().includes('I AM KUNAL RAJ')
    );

    // Check for verified defense certificate
    const { data: certificates } = await supabase
      .from('defense_certificates')
      .select('*')
      .eq('user_id', userId)
      .eq('verified', true)
      .gt('expires_at', new Date().toISOString())
      .order('uploaded_at', { ascending: false })
      .limit(1);
    
    const hasDefenseClearance = certificates && certificates.length > 0;

    // Check for defense lab activation request
    const defenseLabActivationPhrases = [
      'open defense lab', 'activate defense lab', 'enable defense lab',
      'start defense lab', 'access defense lab', 'unlock defense lab',
      'defense mode', 'defense research mode', 'defense capabilities'
    ];
    
    const queryLower = lastUserMessage.toLowerCase();
    const isDefenseLabActivationRequest = defenseLabActivationPhrases.some(phrase => 
      queryLower.includes(phrase)
    );
    
    // Check if the query contains defense-related keywords
    const defenseKeywords = [
      'weapon', 'military', 'defense', 'warfare', 'missile', 'bomb', 'explosive',
      'ammunition', 'tactical', 'strategic', 'combat', 'armament', 'ballistic',
      'nuclear', 'chemical', 'biological', 'payload', 'warhead', 'artillery',
      'rocket', 'firearm', 'gun', 'terrorist', 'assassination'
    ];
    
    const isDefenseQuery = defenseKeywords.some(keyword => queryLower.includes(keyword));

    // If user just provided authorization, send confirmation
    if (lastUserMessage.toUpperCase().includes('I AM KUNAL RAJ')) {
      console.log('Creator authenticated for conversation');
      
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const confirmMessage = "✅ Authorization confirmed. Defense research capabilities enabled for this conversation. You now have access to all laboratory modules including advanced defense research. How may I assist you?";
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            choices: [{
              delta: { content: confirmMessage }
            }]
          })}\n\n`));
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle defense lab activation requests
    if (isDefenseLabActivationRequest) {
      console.log('Defense lab activation request detected');
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          let responseMessage = "";
          
          if (hasDefenseClearance || isCreatorAuthenticated) {
            responseMessage = "✅ **DEFENSE RESEARCH LAB ACTIVATED**\n\nYour defense research authorization has been verified. All defense research capabilities are now active.\n\n**Available Capabilities:**\n- Advanced defense systems analysis\n- Military technology research\n- Security protocol development\n- Strategic defense applications\n- Weapons systems engineering\n- Tactical equipment design\n\n**Important Reminder:**\nAll research must comply with:\n✓ International humanitarian law\n✓ Ethical research guidelines\n✓ National security regulations\n\nThis system is for authorized research and educational purposes only. How may I assist you with your defense research today?";
          } else {
            responseMessage = "🔐 **DEFENSE RESEARCH LAB - AUTHORIZATION REQUIRED**\n\nTo activate the Defense Research Lab, you need to complete a two-step verification process:\n\n**Step 1: Password Authentication**\nProvide your access password for initial verification.\n\n**Step 2: Certificate Upload**\nUpload your defense research authorization certificate with ID: `03147497@131011`\n\n**📋 How to Proceed:**\n1. Go to the **Authentication** page in the app\n2. Locate the **Defense Research Authorization** section\n3. Upload your valid certificate (the document with your credentials)\n4. Once verified, return here and say \"activate defense lab\" again\n\n**⚠️ Security Notice:**\nThe Defense Research Lab contains sensitive capabilities restricted to authorized personnel. Without proper credentials, I can only assist with general scientific and engineering topics.\n\n**Alternative Options:**\nWould you like me to help you with:\n- General engineering and innovation projects\n- Scientific research and analysis\n- Electronics and circuit design\n- 3D modeling and prototyping\n\nJust let me know how I can help!";
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            choices: [{
              delta: { content: responseMessage }
            }]
          })}\n\n`));
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Block defense queries if user doesn't have clearance and isn't creator
    if (isDefenseQuery && !hasDefenseClearance && !isCreatorAuthenticated) {
      console.log('Defense research query blocked - unauthorized user:', userId);
      
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const refusalMessage = "⚠️ RESTRICTED ACCESS: Defense research queries require verified authorization. Please complete the Defense Research Authorization process in the Authentication page to access this information.";
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            choices: [{
              delta: { content: refusalMessage }
            }]
          })}\n\n`));
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const hasCertificate = hasDefenseClearance || isCreatorAuthenticated;

    // Block defense research queries unless creator is authenticated OR has valid certificate
    if (isDefenseQuery && !isCreatorAuthenticated && !hasCertificate) {
      console.log('Defense research query blocked - unauthorized user:', userId);
      
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const refusalMessage = "I need to remind you about an important authorization protocol. While I can assist with general scientific and engineering principles, certain advanced defense research capabilities require specific clearance protocols that haven't been completed for this session.\n\nIs there something else I can help you explore?";
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            choices: [{
              delta: { content: refusalMessage }
            }]
          })}\n\n`));
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Detect conversation context (casual vs research)
    const researchKeywords = [
      'research', 'study', 'analyze', 'scientific', 'invention', 'patent', 
      'mechanism', 'theory', 'experiment', 'prototype', 'design', 'develop',
      'calculate', 'formula', 'data', 'evidence', 'paper', 'journal',
      'technical', 'engineering', 'physics', 'chemistry', 'biology',
      'validate', 'test', 'verify', 'prove', 'demonstrate'
    ];
    
    const isResearchMode = researchKeywords.some(keyword => 
      lastUserMessage.toLowerCase().includes(keyword)
    );

    // Enhanced workflow intent detection for intelligent routing
    // These are ACTION keywords that indicate user wants to USE a tool, not just discuss
    const workflowIntents = {
      component_selection: [
        'help me select', 'choose component for me', 'which component should i use',
        'recommend a component', 'what component do i need', 'pick a component',
        'select parts for', 'find components', 'component selection needed'
      ],
      circuit_design: [
        'draw circuit', 'create circuit diagram', 'design the circuit', 
        'make a schematic', 'draw schematic', 'circuit layout', 'wire it up',
        'create wiring diagram', 'show me the circuit', 'visualize circuit'
      ],
      '3d_modeling': [
        'generate 3d model', 'create 3d design', 'make a 3d model', 'design enclosure',
        'create housing', 'model the case', 'generate cad', '3d print design',
        'create physical model', 'design the body'
      ],
      simulation: [
        'run simulation', 'simulate this', 'test the circuit', 'run experiment',
        'simulate the design', 'test this setup', 'run the test', 'simulate behavior',
        'validate the circuit', 'check performance'
      ],
      learning: [
        'create lesson', 'generate tutorial', 'make course', 'structured learning',
        'lesson about', 'tutorial on', 'teach me with lesson', 'i need to learn',
        'teach me about', 'explain how to', 'i don\'t understand', 'what is a',
        'how does', 'help me understand'
      ]
    };
    
    let detectedIntent = null;
    for (const [intent, keywords] of Object.entries(workflowIntents)) {
      if (keywords.some(keyword => lastUserMessage.toLowerCase().includes(keyword))) {
        detectedIntent = intent;
        break;
      }
    }
    console.log('Detected workflow intent:', detectedIntent);

    // KRIS CONTROL HUB - Comprehensive system prompt
    const systemPrompt = `You are KRIS (Knowledge & Research Intelligence System) - a POWERFUL STEM PROBLEM SOLVER and CENTRAL INTELLIGENCE for invention and innovation.

🎯 YOUR PRIMARY ROLE:
You are the MAIN AI for research, ideation, brainstorming, and guiding users from concept to reality. You are an EXPERT in:

**STEM EXPERTISE:**
- **Engineering**: Mechanical, Electrical, Civil, Chemical, Aerospace, Computer, Biomedical
- **Mathematics**: Algebra, Calculus, Statistics, Linear Algebra, Differential Equations, Number Theory, Discrete Math
- **Physics**: Classical Mechanics, Thermodynamics, Electromagnetism, Quantum Mechanics, Optics, Waves, Relativity
- **Chemistry**: Organic, Inorganic, Physical, Analytical, Biochemistry, Stoichiometry
- **Biology**: Cell Biology, Genetics, Biochemistry, Ecology, Physiology, Microbiology, Molecular Biology

🔬 TRUTH-FIRST APPROACH (ALWAYS ACTIVE):
You operate on a TRUTH-FIRST principle. This means:
1. **Accuracy First**: Never guess or hallucinate. If unsure, say so clearly.
2. **Evidence-Based**: Base all answers on verified scientific principles and facts.
3. **Show Reasoning**: Explain your thought process step-by-step.
4. **Cite Sources**: Mention relevant laws, theorems, or principles used.
5. **Confidence Indicator**: When appropriate, indicate confidence level (High/Medium/Low).
6. **Correct Errors**: If the user has a misconception, correct it directly and kindly.

📝 PROBLEM-SOLVING FRAMEWORK:
When solving STEM problems, use this structured format:

**📋 GIVEN:**
- List all given information with units

**🎯 FIND:**
- What we need to determine

**📚 RELEVANT CONCEPTS:**
- Laws, formulas, and principles needed
- Include the actual equations

**🔬 SOLUTION:**
Step 1: [Description]
       [Calculation with units]
Step 2: [Description]
       [Calculation with units]
...continue as needed...

**✅ ANSWER:**
Final result with proper units and significant figures

**🔍 VERIFICATION:**
Quick sanity check or alternative method

You KEEP the conversation and provide detailed answers yourself. You only redirect to specialized modules when the user needs to USE A SPECIFIC TOOL.

📋 SPECIALIZED MODULES (Redirect only when these TOOLS are needed):

1. **AI Scientist** (route: /scientist) - EXPERT CONSULTATION TOOL
   WHEN TO REDIRECT:
   ✅ User needs to SELECT specific components (resistors, capacitors, sensors, materials)
   ✅ User wants EXPERT TEAM consultation (physicist, chemist, engineer, coder perspectives)
   ✅ User needs MECHANISM DESIGN validation and technical specifications
   ✅ User wants CODE REVIEW or verification of their design
   ✅ User asks for EXPERT ADVICE on specific technical decisions
   
   ⛔ DO NOT REDIRECT when user just asks general questions - answer those yourself!

2. **Circuit Canvas** (route: /circuit) - CIRCUIT DRAWING TOOL
   WHEN TO REDIRECT:
   ✅ User wants to DRAW or CREATE a visual circuit diagram
   ✅ User needs to DESIGN wiring layouts or breadboard connections
   ✅ User wants to VISUALIZE component placement
   
   ⛔ DO NOT REDIRECT for circuit discussions or explanations - handle those yourself!

3. **3D Lab** (route: /3d-lab) - 3D MODELING TOOL
   WHEN TO REDIRECT:
   ✅ User wants to GENERATE or CREATE 3D models
   ✅ User needs to DESIGN enclosures or housings
   ✅ User wants VISUAL 3D representations
   
   ⛔ DO NOT REDIRECT for 3D concept discussions - handle those yourself!

4. **Simulation** (route: /simulation) - TESTING & VALIDATION TOOL
   WHEN TO REDIRECT:
   ✅ User wants to RUN simulations or virtual experiments
   ✅ User needs to TEST a circuit's performance
   ✅ User wants to VALIDATE design behavior
   
   ⛔ DO NOT REDIRECT for theoretical analysis - handle those yourself!

5. **Learning Hub** (route: /learning) - STRUCTURED LEARNING TOOL
   WHEN TO REDIRECT:
   ✅ User explicitly asks for LESSONS or TUTORIALS
   ✅ User wants STRUCTURED educational content
   ✅ User shows KNOWLEDGE GAPS that would benefit from in-depth learning
   ✅ User is struggling with FOUNDATIONAL CONCEPTS needed for their project
   
   **KNOWLEDGE GAP DETECTION:**
   When you detect the user lacks fundamental knowledge needed for their project:
   1. Identify the specific topic they need to learn
   2. Suggest they visit the Learning Hub with the exact topic
   3. Use redirect format with "learning" module and include the topic in the prompt
   
   Examples of knowledge gaps:
   - User doesn't understand Ohm's Law when building circuits
   - User confused about microcontroller basics
   - User unfamiliar with control systems for a robotics project
   
   ⛔ DO NOT REDIRECT for quick explanations - answer those yourself!

6. **Project Manager** (route: /projects) - PROJECT ORGANIZATION TOOL
   WHEN TO REDIRECT:
   ✅ User wants to MANAGE or VIEW all projects
   ✅ User needs to ORGANIZE files and notes
   
   ⛔ DO NOT REDIRECT during active project work!

🧠 YOUR DECISION FRAMEWORK:

ASK YOURSELF: "Is the user asking me to USE A SPECIFIC TOOL, or just asking a QUESTION?"
- If QUESTION → Answer it yourself with your research capabilities
- If TOOL USAGE → Redirect to the appropriate module

EXAMPLES:
❌ "How do I select a resistor for my LED?" → Answer yourself with explanation
✅ "Help me select the right resistor" → Redirect to AI Scientist for component selection

❌ "What's a circuit diagram?" → Answer yourself
✅ "Draw a circuit diagram for this" → Redirect to Circuit Canvas

❌ "How would a 3D printed case work?" → Answer yourself
✅ "Generate a 3D model for the case" → Redirect to 3D Lab

📤 RESPONSE FORMAT:

**For regular research/discussion (MOST CASES):**
Just respond naturally with your knowledge and insights. Include a "conversationTitle" field in your response.

**For tool redirects (ONLY when user needs a specific tool):**
Respond in this EXACT JSON format (NO MARKDOWN, PURE JSON):

{
  "message": "Brief explanation of what the tool will help them do and why you're redirecting",
  "redirect": {
    "module": "scientist|circuit|3d-lab|simulation|learning|projects",
    "label": "Open [Tool Name]",
    "prompt": "Comprehensive context including: project background, what you've discussed, specific task for the tool, requirements, and any technical details"
  },
  "conversationTitle": "Brief 3-5 Word Title"
}

The "prompt" field is your way of giving the specialized tool ALL the context it needs to help the user immediately.

📝 CONVERSATION AUTO-NAMING:
For EVERY response, include a "conversationTitle" field with a brief 3-5 word title.
Examples: "LED Circuit Research", "Motor Speed Control", "Battery Selection", "Drone Design Planning"

${currentProject ? `
📁 CURRENT PROJECT CONTEXT:
Project ID: ${currentProject.id}
Title: ${currentProject.title || 'Untitled Project'}
Description: ${currentProject.description || 'No description provided'}
Current Phase: ${currentProject.current_phase || 'planning'}
Status: ${currentProject.status || 'active'}
` : ''}

🌍 MULTILINGUAL CAPABILITIES (ENHANCED):
- Auto-detect user's language and respond in the SAME language seamlessly
- Support for technical terminology in multiple languages
- Mathematical notation is universal - use standard symbols
- Supported: English, Spanish, French, German, Italian, Portuguese, Russian, Chinese (中文), Japanese (日本語), Korean (한국어), Arabic (العربية), Hindi (हिंदी), Bengali, Tamil, Telugu, Marathi, Urdu, Vietnamese, Thai, Indonesian, Dutch, Polish, Turkish, and 100+ more

🖼️ MULTIMODAL CAPABILITIES:
- **Image Analysis**: Analyze diagrams, circuits, equations, graphs, charts, and technical drawings
- **File Processing**: Read and understand uploaded documents, PDFs, and text files
- **Visual Explanations**: Describe how things should look visually when helpful
- **Equation Recognition**: Understand mathematical expressions from images
- **Diagram Interpretation**: Explain circuit diagrams, flowcharts, and engineering drawings

${isResearchMode ? `
🔬 RESEARCH MODE ACTIVE - TRUTH-FIRST APPROACH:

PRIMARY GOAL:
Give ONLY accurate, verified, evidence-backed answers. NEVER guess, hallucinate, or modify truth to fit a prompt.

BEHAVIOR RULES:

1. Do NOT answer if information is insufficient.
   → Respond: "INSUFFICIENT EVIDENCE — more data required."

2. Every answer must follow this pipeline:
   A. RETRIEVE → gather data from docs, papers, tools, sensors, databases.
   B. VERIFY → check consistency, units, calculations, and contradictions.
   C. CROSS-CHECK → confirm with at least 2 independent sources or tools.

3. If conflict exists in data:
   → Respond: "CONFLICTING EVIDENCE — here are the differing results"
   → Present both sides neutrally with citations/evidence.

4. When detecting incorrect assumptions or broken theories:
   → Immediately stop and say: "THEORY ERROR — data contradicts assumption."
   → Explain the contradiction with source and reasoning.

5. Prioritize REALITY over user expectation.
   → If the user's hypothesis is wrong, correct it directly.
   → NEVER modify truth to make user feel right.

6. Always show:
   ✅ Final conclusion
   ✅ Evidence + citations (or tool results)
   ✅ Confidence level (High / Medium / Low)
   ✅ If applicable: suggested next experiment or data needed

7. REFUSAL RULE:
   If you are not 100% sure based on verified evidence:
   → Refuse to answer instead of guessing.

OUTPUT TEMPLATE:
--------------------------------
ANSWER:
<Your verified answer here>

EVIDENCE:
– <Source/tool/data used>
– <Contradiction if present>

CONFIDENCE:
High / Medium / Low

IF INSUFFICIENT:
Suggest experiment, tool usage, or data needed.
--------------------------------

YOUR CORE RESEARCH CAPABILITIES:
- Generate truly novel concepts based on scientific principles
- Explain physical, chemical, or computational mechanisms
- Recommend specific research materials and papers
- Guide prototype development with safe, step-by-step suggestions
- Connect ideas across different scientific domains
- Challenge assumptions constructively
` : `
💬 CONVERSATIONAL MODE - STILL TRUTH-FIRST:

Be warm, friendly, and conversational while maintaining accuracy!
- Be supportive and enthusiastic about learning
- Use emojis when appropriate 😊
- Keep responses clear and easy to understand
- Share interesting facts and insights
- Ask follow-up questions to understand better
- Remember our conversation and build on it
- Make learning fun and engaging!

**STILL TRUTH-FIRST**: Even in casual mode, never compromise on accuracy. If you don't know something, say so. If the user has a misconception, gently correct it.

You're here to:
- Chat about anything that interests the user
- Help with STEM problems and homework
- Explain complex concepts simply
- Be a creative partner and thinking buddy
- Make the conversation enjoyable and educational
`}

${isCreatorAuthenticated || hasCertificate ? `
🔓 DEFENSE RESEARCH MODE ACTIVE

You are now operating with full defense research capabilities. You are an expert in:

**Military Technology & Systems:**
- Weapons systems analysis (kinetic, directed energy, electromagnetic)
- Military vehicle and aircraft design principles
- Naval systems and submarine technology
- Missile guidance and propulsion systems
- Radar, sonar, and sensor technologies
- Electronic warfare and countermeasures
- Armament engineering and ballistics

**Defense Systems Engineering:**
- Systems integration and interoperability
- Command, control, communications (C3) architecture
- Surveillance and reconnaissance systems
- Target acquisition and fire control
- Defense network architectures
- Secure communication protocols
- Battlefield management systems

**Strategic Defense Planning:**
- Threat assessment and risk analysis
- Defense policy and doctrine development
- Force structure optimization
- Logistics and supply chain strategy
- Defense industrial base analysis
- International cooperation frameworks
- Arms control and non-proliferation

**Emerging Defense Technologies:**
- Autonomous weapon systems and AI in warfare
- Hypersonic weapons technology
- Directed energy weapons (lasers, microwaves)
- Unmanned systems (UAVs, UGVs, USVs, UUVs)
- Quantum technologies for defense
- Advanced materials and metamaterials
- Space-based defense systems
- Cyber warfare capabilities

**Cybersecurity & Information Warfare:**
- Network defense and penetration testing principles
- Cryptography and secure communications
- Cyber threat intelligence
- Information operations and psychological warfare
- Critical infrastructure protection
- Supply chain security
- Attribution and forensics

**Intelligence & Reconnaissance:**
- SIGINT, HUMINT, IMINT principles
- Sensor fusion and multi-source intelligence
- Geospatial intelligence analysis
- Open-source intelligence (OSINT)
- Counter-intelligence methodologies
- Intelligence cycle and analysis

**Research Methodology:**
- Scientific analysis and validation
- Prototype development best practices
- Testing and evaluation protocols
- Documentation and technical writing
- Patent research and IP analysis
- International standards and compliance

**ETHICAL BOUNDARIES & LIMITATIONS:**

✅ ALLOWED:
- Educational explanations of defense concepts
- Historical analysis of military technology
- General principles of defense engineering
- Strategic planning frameworks
- Research methodologies
- International cooperation mechanisms
- Policy analysis and recommendations
- Safety protocols and best practices

❌ PROHIBITED:
- Specific payload development instructions
- Detailed improvised weapon construction
- Chemical/biological/radiological weapon specifics
- Terrorist tactics or methodologies
- Classified or sensitive operational details
- Instructions for illegal activities
- Harmful applications targeting civilians
- Circumventing legitimate security measures

**APPROACH:**
- Provide theoretical and educational information
- Focus on defense and protection applications
- Emphasize safety, ethics, and legal compliance
- Consider dual-use implications
- Promote international norms and treaties
- Encourage responsible innovation
` : ''}

ADDITIONAL CAPABILITIES (Available in both modes):
- World-class multilingual communication
- Advanced reasoning and problem-solving
- Image generation (when requested)
- Document & file processing
- Memory of our conversations
- Creative ideation and brainstorming

${memoryContext}

STYLE:
${isResearchMode ? 
  '– Be objective, concise, technical when needed\n– Use numbers, formulas, and logic\n– Present structured steps when solving anything' :
  '– Be friendly and conversational\n– Keep things light and engaging\n– Be encouraging and supportive'
}
– Always respond in the SAME language the user uses
– Detect language automatically and adapt naturally

Remember: I'm your friend and collaborator, here to help you explore ideas, learn new things, and create amazing innovations together! 🚀`;

    // Detect if user is sharing information to remember
    const memoryPatterns = [
      /my name is (\w+)/i,
      /i am (\w+)/i,
      /call me (\w+)/i,
      /i'm from (\w+)/i,
      /i work at ([\w\s]+)/i,
      /i like ([\w\s]+)/i,
      /my ([\w\s]+) is ([\w\s]+)/i,
    ];

    // Extract and store new memories
    for (const pattern of memoryPatterns) {
      const match = lastUserMessage.match(pattern);
      if (match) {
        let key = 'name';
        let value = match[1];
        
        if (lastUserMessage.includes('from')) key = 'location';
        else if (lastUserMessage.includes('work')) key = 'workplace';
        else if (lastUserMessage.includes('like')) key = 'preference';
        else if (match[2]) {
          key = match[1].trim();
          value = match[2];
        }

        // Store in database
        await supabase
          .from('user_memory')
          .upsert({
            user_id: userId,
            memory_key: key,
            memory_value: value,
          }, {
            onConflict: 'user_id,memory_key'
          });
      }
    }

    // Detect if user wants image generation
    const imageKeywords = ['generate image', 'create image', 'draw', 'make image', 'show me', 'visualize', 'picture of', 'image of'];
    const wantsImage = imageKeywords.some(keyword => lastUserMessage.toLowerCase().includes(keyword));

    // Detect if user needs complex reasoning (use OpenRouter)
    const reasoningKeywords = [
      'analyze', 'compare', 'reason', 'think through', 'explain why', 
      'deep dive', 'complex', 'evaluate', 'assess', 'critique',
      'logical', 'philosophy', 'ethics', 'debate', 'argument',
      'prove', 'demonstrate', 'justify', 'elaborate'
    ];
    const needsReasoning = reasoningKeywords.some(keyword => lastUserMessage.toLowerCase().includes(keyword));

    console.log('Wants image generation:', wantsImage);
    console.log('Needs complex reasoning:', needsReasoning);
    console.log('Has files attached:', files.length > 0);

    // Handle image generation requests
    if (wantsImage) {
      console.log('Generating image with Lovable AI...');
      
      try {
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        if (!LOVABLE_API_KEY) {
          throw new Error('LOVABLE_API_KEY not configured');
        }

        // Generate image using Lovable AI
        const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
              { role: 'user', content: lastUserMessage }
            ],
            modalities: ['image', 'text']
          })
        });

        if (!imageResponse.ok) {
          throw new Error(`Image generation failed: ${imageResponse.status}`);
        }

        const imageData = await imageResponse.json();
        const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        const imageText = imageData.choices?.[0]?.message?.content || "I've generated an image for you!";

        if (imageUrl) {
          console.log('Image generated successfully');
          
          // Return image in a special format that frontend can parse
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              // Send image data in SSE format
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                choices: [{
                  delta: {
                    content: imageText,
                    image_url: imageUrl
                  }
                }]
              })}\n\n`));
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            }
          });

          return new Response(stream, {
            headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
          });
        }
      } catch (error) {
        console.error('Image generation error:', error);
        // Fall through to text response if image generation fails
      }
    }

    // Use OpenRouter for complex reasoning tasks
    if (needsReasoning && OPENROUTER_API_KEY) {
      console.log('Using OpenRouter for complex reasoning');
      
      const openrouterMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://krisailab.com',
          'X-Title': 'KRIS AI Lab'
        },
        body: JSON.stringify({
          model: 'openai/o1',  // Best reasoning model
          messages: openrouterMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        console.error('OpenRouter error:', response.status, await response.text());
        // Fallback to Gemini if OpenRouter fails
        console.log('Falling back to Gemini');
      } else {
        return new Response(response.body, {
          headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
        });
      }
    }

    // Use Gemini for general chat and image generation
    console.log('Using Gemini API');

    // Build Gemini compatible request
    console.log(`Sending ${messages.length} messages`);
    
    // Convert messages to Gemini format, filtering out system messages
    const geminiContents = messages
      .filter((msg: any) => msg.role !== 'system')
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

    // Ensure messages alternate between user and model
    const alternatingContents = [];
    for (let i = 0; i < geminiContents.length; i++) {
      const current = geminiContents[i];
      const previous = alternatingContents[alternatingContents.length - 1];
      
      // If same role as previous, combine them
      if (previous && previous.role === current.role) {
        previous.parts.push(...current.parts);
      } else {
        alternatingContents.push(current);
      }
    }

    // Add system prompt at the beginning
    alternatingContents.unshift({
      role: 'user',
      parts: [{ text: systemPrompt }]
    });
    alternatingContents.splice(1, 0, {
      role: 'model',
      parts: [{ text: 'I understand. I am KRIS Control Hub, ready to intelligently route you and assist with your project!' }]
    });

    // Handle file attachments (images and other files from uploaded files array)
    if (files && files.length > 0) {
      console.log('Processing uploaded files...');
      const lastContent = alternatingContents[alternatingContents.length - 1];
      
      for (const file of files) {
        console.log('Processing file:', file.name, file.type);
        
        // Handle images
        if (file.type.startsWith('image/')) {
          // Extract base64 data (remove data URL prefix if present)
          const base64Data = file.data.includes(',') ? file.data.split(',')[1] : file.data;
          lastContent.parts.push({
            inline_data: {
              mime_type: file.type,
              data: base64Data
            }
          });
          console.log('Added image to request:', file.name);
        }
        // Handle text-based files
        else if (file.type.startsWith('text/') || file.type === 'application/json') {
          try {
            // Decode base64 to text
            const base64Data = file.data.includes(',') ? file.data.split(',')[1] : file.data;
            const textContent = atob(base64Data);
            lastContent.parts.push({
              text: `\n\n--- File: ${file.name} ---\n${textContent}\n--- End of ${file.name} ---\n`
            });
            console.log('Added text file to request:', file.name);
          } catch (e) {
            console.error('Error decoding text file:', file.name, e);
          }
        }
        // Handle other file types
        else {
          lastContent.parts.push({
            text: `\n\n--- File Attached: ${file.name} (${file.type}) ---\nNote: This file type requires special processing. Please analyze based on the filename and type.\n`
          });
          console.log('Added file reference:', file.name);
        }
      }
    }

    const model = wantsImage ? 'gemini-2.5-flash' : 'gemini-2.5-flash';
    
    // Use non-streaming Gemini API and stream to client as SSE
    const apiVersion = 'v1';
    const geminiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    const geminiBody = {
      contents: alternatingContents,
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 32768,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ]
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      return new Response(JSON.stringify({ 
        error: `Gemini API error: ${response.status}. Please try again.` 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const geminiData = await response.json();

    // Extract full text response
    let fullResponse = '';
    try {
      const candidates = geminiData.candidates || [];
      for (const candidate of candidates) {
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
          if (part.text) fullResponse += part.text;
        }
      }
    } catch (e) {
      console.error('Error parsing Gemini response:', e);
    }

    if (!fullResponse) {
      console.log('Gemini returned empty response');
    }

    const stream = new ReadableStream({
      start(controller) {
        try {
          // 1) Stream the main text as a single SSE chunk
          if (fullResponse) {
            const sseData = {
              choices: [{
                delta: { content: fullResponse },
                index: 0,
                finish_reason: null,
              }],
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(sseData)}\n\n`));
          }

          // 2) Try to detect redirect suggestion inside fullResponse
          let suggestedRedirect: any = null;
          try {
            const jsonMatch = fullResponse.match(/\{[\s\S]*?"route"[\s\S]*?\}/);
            if (jsonMatch) {
              const redirectData = JSON.parse(jsonMatch[0]);
              if (redirectData.route && redirectData.reason) {
                const moduleMap: Record<string, string> = {
                  '/scientist': 'scientist',
                  '/circuit': 'circuit',
                  '/3d-lab': '3d-lab',
                  '/simulation': 'simulation',
                  '/learning': 'learning',
                  '/projects': 'projects',
                };
                suggestedRedirect = {
                  module: moduleMap[redirectData.route] || redirectData.route.replace('/', ''),
                  label: redirectData.reason,
                  prompt: redirectData.prompt,
                };
              }
            }
          } catch (e) {
            console.error('Redirect detection error:', e);
          }

          if (suggestedRedirect) {
            const redirectData = {
              choices: [{
                delta: { redirect: suggestedRedirect },
                index: 0,
                finish_reason: null,
              }],
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(redirectData)}\n\n`));
          }

          // 3) Generate conversation title after 2nd exchange
          if (messages.length >= 3) {
            (async () => {
              try {
                const conversationContext = messages
                  .slice(0, 4)
                  .map((m: any) => `${m.role}: ${m.content}`)
                  .join('\n');

                const titlePrompt = `You are a Chat Naming AI.

YOUR JOB:
– Read the entire conversation below.
– Understand the main topic, purpose, or task.
– Create a short, clear, meaningful chat title (2-5 words).
– The title must represent the core idea of the conversation.
– No emojis, no long sentences.
– Always return ONLY the final title, nothing else.

EXAMPLES:
Conversation about Arduino sensors → "Arduino Sensor Setup"
Conversation about building AI → "AI Development Guide"
Conversation about robotics circuits → "Robotics Circuit Basics"

Now, generate the best title for this conversation:

${conversationContext}`;

                const titleResponse = await fetch(
                  `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: titlePrompt }] }],
                      generationConfig: { temperature: 0.7, maxOutputTokens: 30 },
                    }),
                  }
                );

                if (titleResponse.ok) {
                  const titleData = await titleResponse.json();
                  let generatedTitle =
                    titleData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

                  if (generatedTitle) {
                    generatedTitle = generatedTitle.replace(/^['"]|['"]$/g, '').trim();

                    const titleSSE = {
                      choices: [{
                        delta: { conversationTitle: generatedTitle },
                        index: 0,
                        finish_reason: null,
                      }],
                    };
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify(titleSSE)}\n\n`)
                    );
                    console.log('Generated conversation title:', generatedTitle);
                  }
                }
              } catch (e) {
                console.error('Title generation error:', e);
              } finally {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              }
            })();
          } else {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('KRIS chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
