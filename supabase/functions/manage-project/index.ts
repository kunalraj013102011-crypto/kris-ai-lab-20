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

    const { action, projectId, projectData } = await req.json();

    console.log('Project management action:', action, 'User:', user.id, 'ProjectId:', projectId);

    // Handle different project management actions
    if (action === 'create') {
      // Create new project
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: projectData.title,
          description: projectData.description,
          status: 'discussion',
          current_phase: 'discussion',
          project_data: projectData
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial phase
      await supabase
        .from('project_phases')
        .insert({
          project_id: project.id,
          phase_name: 'discussion',
          status: 'in_progress'
        });

      return new Response(JSON.stringify({ success: true, project }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update') {
      // Update existing project
      const { data: project, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, project }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get') {
      // Get project details
      const { data: project, error } = await supabase
        .from('projects')
        .select('*, project_phases(*)')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, project }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'list') {
      // List all user projects
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, projects }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update_phase') {
      // Update project phase
      const { phaseName, phaseData } = projectData;

      // Update project current_phase
      await supabase
        .from('projects')
        .update({ current_phase: phaseName })
        .eq('id', projectId)
        .eq('user_id', user.id);

      // Create or update phase record
      const { data: existingPhase } = await supabase
        .from('project_phases')
        .select('*')
        .eq('project_id', projectId)
        .eq('phase_name', phaseName)
        .single();

      if (existingPhase) {
        await supabase
          .from('project_phases')
          .update({
            status: 'completed',
            data: phaseData,
            completed_at: new Date().toISOString()
          })
          .eq('id', existingPhase.id);
      } else {
        await supabase
          .from('project_phases')
          .insert({
            project_id: projectId,
            phase_name: phaseName,
            status: 'in_progress',
            data: phaseData
          });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'create_report') {
      // Create final project report
      const { reportType, content } = projectData;

      const { data: report, error } = await supabase
        .from('project_reports')
        .insert({
          project_id: projectId,
          report_type: reportType,
          content: content
        })
        .select()
        .single();

      if (error) throw error;

      // Mark project as completed
      await supabase
        .from('projects')
        .update({ status: 'completed' })
        .eq('id', projectId)
        .eq('user_id', user.id);

      return new Response(JSON.stringify({ success: true, report }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Project management error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
