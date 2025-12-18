-- Create workspaces table for collaborative group projects
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create workspace members table
CREATE TABLE public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (workspace_id, user_id)
);

-- Create workspace projects table
CREATE TABLE public.workspace_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    project_data JSONB,
    created_by UUID NOT NULL,
    current_phase TEXT NOT NULL DEFAULT 'planning',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they are members of"
ON public.workspaces FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.workspace_members 
        WHERE workspace_members.workspace_id = workspaces.id 
        AND workspace_members.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their workspaces"
ON public.workspaces FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their workspaces"
ON public.workspaces FOR DELETE
USING (auth.uid() = owner_id);

-- RLS Policies for workspace_members
CREATE POLICY "Members can view workspace members"
ON public.workspace_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.workspace_id = workspace_members.workspace_id 
        AND wm.user_id = auth.uid()
    )
);

CREATE POLICY "Workspace owners can add members"
ON public.workspace_members FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.workspaces 
        WHERE workspaces.id = workspace_members.workspace_id 
        AND workspaces.owner_id = auth.uid()
    ) OR auth.uid() = user_id
);

CREATE POLICY "Workspace owners can remove members"
ON public.workspace_members FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.workspaces 
        WHERE workspaces.id = workspace_members.workspace_id 
        AND workspaces.owner_id = auth.uid()
    )
);

-- RLS Policies for workspace_projects
CREATE POLICY "Members can view workspace projects"
ON public.workspace_projects FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.workspace_members 
        WHERE workspace_members.workspace_id = workspace_projects.workspace_id 
        AND workspace_members.user_id = auth.uid()
    )
);

CREATE POLICY "Members can create workspace projects"
ON public.workspace_projects FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.workspace_members 
        WHERE workspace_members.workspace_id = workspace_projects.workspace_id 
        AND workspace_members.user_id = auth.uid()
    )
);

CREATE POLICY "Members can update workspace projects"
ON public.workspace_projects FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.workspace_members 
        WHERE workspace_members.workspace_id = workspace_projects.workspace_id 
        AND workspace_members.user_id = auth.uid()
    )
);

CREATE POLICY "Project creators can delete workspace projects"
ON public.workspace_projects FOR DELETE
USING (auth.uid() = created_by);

-- Create trigger for updated_at on workspaces
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON public.workspaces
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_updated_at();

-- Create trigger for updated_at on workspace_projects
CREATE TRIGGER update_workspace_projects_updated_at
BEFORE UPDATE ON public.workspace_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_updated_at();

-- Enable realtime for workspace_projects
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_projects;