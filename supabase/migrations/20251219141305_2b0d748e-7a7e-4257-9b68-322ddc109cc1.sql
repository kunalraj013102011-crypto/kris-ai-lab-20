-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;

-- Create a security definer function to check workspace membership without recursion
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
  )
$$;

-- Create a security definer function to check workspace ownership
CREATE OR REPLACE FUNCTION public.is_workspace_owner(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspaces
    WHERE id = _workspace_id
      AND owner_id = _user_id
  )
$$;

-- Recreate workspaces SELECT policy using the function
CREATE POLICY "Users can view workspaces they are members of"
ON public.workspaces
FOR SELECT
USING (public.is_workspace_member(auth.uid(), id) OR owner_id = auth.uid());

-- Recreate workspace_members SELECT policy using the function
CREATE POLICY "Members can view workspace members"
ON public.workspace_members
FOR SELECT
USING (public.is_workspace_member(auth.uid(), workspace_id));

-- Add workspace_invitations table
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days')
);

-- Enable RLS on invitations
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Invitation policies
CREATE POLICY "Workspace owners can create invitations"
ON public.workspace_invitations
FOR INSERT
WITH CHECK (public.is_workspace_owner(auth.uid(), workspace_id) OR public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users can view invitations for their email"
ON public.workspace_invitations
FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR public.is_workspace_member(auth.uid(), workspace_id)
);

CREATE POLICY "Users can update their own invitations"
ON public.workspace_invitations
FOR UPDATE
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Workspace owners can delete invitations"
ON public.workspace_invitations
FOR DELETE
USING (public.is_workspace_owner(auth.uid(), workspace_id));