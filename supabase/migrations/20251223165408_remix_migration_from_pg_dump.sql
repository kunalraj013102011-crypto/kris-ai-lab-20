CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: is_workspace_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_workspace_member(_user_id uuid, _workspace_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
  )
$$;


--
-- Name: is_workspace_owner(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_workspace_owner(_user_id uuid, _workspace_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspaces
    WHERE id = _workspace_id
      AND owner_id = _user_id
  )
$$;


--
-- Name: update_conversation_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_conversation_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_user_memory_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_memory_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: chat_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    conversation_id uuid,
    CONSTRAINT chat_history_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: defense_certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.defense_certificates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    certificate_url text NOT NULL,
    verified boolean DEFAULT false,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone
);


--
-- Name: engineering_lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.engineering_lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    description text,
    difficulty text DEFAULT 'beginner'::text NOT NULL,
    content text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lesson_chat_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_chat_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    lesson_progress_id uuid,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lesson_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lesson_progress_id uuid,
    user_id uuid NOT NULL,
    section_id text NOT NULL,
    section_title text NOT NULL,
    summary text,
    full_content text,
    is_expanded boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: project_phases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_phases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    phase_name text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: project_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    report_type text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'discussion'::text NOT NULL,
    current_phase text DEFAULT 'discussion'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    lesson_completed boolean DEFAULT false,
    design_completed boolean DEFAULT false,
    circuit_completed boolean DEFAULT false,
    simulation_completed boolean DEFAULT false,
    project_data jsonb DEFAULT '{}'::jsonb
);


--
-- Name: user_lesson_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_lesson_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    lesson_id uuid,
    custom_topic text,
    status text DEFAULT 'in_progress'::text NOT NULL,
    ai_content text,
    notes text,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_memory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_memory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    memory_key text NOT NULL,
    memory_value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: workspace_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    email text NOT NULL,
    invited_by uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL
);


--
-- Name: workspace_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT workspace_members_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])))
);


--
-- Name: workspace_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    project_data jsonb,
    created_by uuid NOT NULL,
    current_phase text DEFAULT 'planning'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    owner_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_history chat_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_history
    ADD CONSTRAINT chat_history_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: defense_certificates defense_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.defense_certificates
    ADD CONSTRAINT defense_certificates_pkey PRIMARY KEY (id);


--
-- Name: engineering_lessons engineering_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engineering_lessons
    ADD CONSTRAINT engineering_lessons_pkey PRIMARY KEY (id);


--
-- Name: lesson_chat_history lesson_chat_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_chat_history
    ADD CONSTRAINT lesson_chat_history_pkey PRIMARY KEY (id);


--
-- Name: lesson_sections lesson_sections_lesson_progress_id_section_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_sections
    ADD CONSTRAINT lesson_sections_lesson_progress_id_section_id_key UNIQUE (lesson_progress_id, section_id);


--
-- Name: lesson_sections lesson_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_sections
    ADD CONSTRAINT lesson_sections_pkey PRIMARY KEY (id);


--
-- Name: project_phases project_phases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_phases
    ADD CONSTRAINT project_phases_pkey PRIMARY KEY (id);


--
-- Name: project_reports project_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_reports
    ADD CONSTRAINT project_reports_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: user_lesson_progress user_lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lesson_progress
    ADD CONSTRAINT user_lesson_progress_pkey PRIMARY KEY (id);


--
-- Name: user_memory user_memory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_memory
    ADD CONSTRAINT user_memory_pkey PRIMARY KEY (id);


--
-- Name: workspace_invitations workspace_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_invitations
    ADD CONSTRAINT workspace_invitations_pkey PRIMARY KEY (id);


--
-- Name: workspace_members workspace_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_pkey PRIMARY KEY (id);


--
-- Name: workspace_members workspace_members_workspace_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_workspace_id_user_id_key UNIQUE (workspace_id, user_id);


--
-- Name: workspace_projects workspace_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_projects
    ADD CONSTRAINT workspace_projects_pkey PRIMARY KEY (id);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: idx_chat_history_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_history_conversation_id ON public.chat_history USING btree (conversation_id);


--
-- Name: idx_chat_history_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_history_created_at ON public.chat_history USING btree (created_at DESC);


--
-- Name: idx_chat_history_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_history_user_id ON public.chat_history USING btree (user_id);


--
-- Name: idx_conversations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_user_id ON public.conversations USING btree (user_id);


--
-- Name: idx_defense_certificates_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_defense_certificates_user_id ON public.defense_certificates USING btree (user_id);


--
-- Name: idx_defense_certificates_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_defense_certificates_verified ON public.defense_certificates USING btree (verified);


--
-- Name: idx_user_memory_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_memory_user_id ON public.user_memory USING btree (user_id);


--
-- Name: idx_user_memory_user_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_user_memory_user_key ON public.user_memory USING btree (user_id, memory_key);


--
-- Name: conversations update_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_conversation_updated_at();


--
-- Name: lesson_sections update_lesson_sections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_lesson_sections_updated_at BEFORE UPDATE ON public.lesson_sections FOR EACH ROW EXECUTE FUNCTION public.update_user_memory_updated_at();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_conversation_updated_at();


--
-- Name: user_memory update_user_memory_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_memory_timestamp BEFORE UPDATE ON public.user_memory FOR EACH ROW EXECUTE FUNCTION public.update_user_memory_updated_at();


--
-- Name: workspace_projects update_workspace_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_workspace_projects_updated_at BEFORE UPDATE ON public.workspace_projects FOR EACH ROW EXECUTE FUNCTION public.update_conversation_updated_at();


--
-- Name: workspaces update_workspaces_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_conversation_updated_at();


--
-- Name: chat_history chat_history_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_history
    ADD CONSTRAINT chat_history_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: defense_certificates fk_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.defense_certificates
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: lesson_chat_history lesson_chat_history_lesson_progress_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_chat_history
    ADD CONSTRAINT lesson_chat_history_lesson_progress_id_fkey FOREIGN KEY (lesson_progress_id) REFERENCES public.user_lesson_progress(id) ON DELETE CASCADE;


--
-- Name: lesson_sections lesson_sections_lesson_progress_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_sections
    ADD CONSTRAINT lesson_sections_lesson_progress_id_fkey FOREIGN KEY (lesson_progress_id) REFERENCES public.user_lesson_progress(id) ON DELETE CASCADE;


--
-- Name: project_phases project_phases_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_phases
    ADD CONSTRAINT project_phases_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_reports project_reports_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_reports
    ADD CONSTRAINT project_reports_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: user_lesson_progress user_lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lesson_progress
    ADD CONSTRAINT user_lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.engineering_lessons(id) ON DELETE CASCADE;


--
-- Name: workspace_invitations workspace_invitations_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_invitations
    ADD CONSTRAINT workspace_invitations_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: workspace_projects workspace_projects_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_projects
    ADD CONSTRAINT workspace_projects_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: engineering_lessons Anyone can view lessons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view lessons" ON public.engineering_lessons FOR SELECT USING (true);


--
-- Name: workspace_projects Members can create workspace projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can create workspace projects" ON public.workspace_projects FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.workspace_members
  WHERE ((workspace_members.workspace_id = workspace_projects.workspace_id) AND (workspace_members.user_id = auth.uid())))));


--
-- Name: workspace_projects Members can update workspace projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can update workspace projects" ON public.workspace_projects FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.workspace_members
  WHERE ((workspace_members.workspace_id = workspace_projects.workspace_id) AND (workspace_members.user_id = auth.uid())))));


--
-- Name: workspace_members Members can view workspace members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view workspace members" ON public.workspace_members FOR SELECT USING (public.is_workspace_member(auth.uid(), workspace_id));


--
-- Name: workspace_projects Members can view workspace projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view workspace projects" ON public.workspace_projects FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.workspace_members
  WHERE ((workspace_members.workspace_id = workspace_projects.workspace_id) AND (workspace_members.user_id = auth.uid())))));


--
-- Name: workspaces Owners can delete their workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can delete their workspaces" ON public.workspaces FOR DELETE USING ((auth.uid() = owner_id));


--
-- Name: workspaces Owners can update their workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can update their workspaces" ON public.workspaces FOR UPDATE USING ((auth.uid() = owner_id));


--
-- Name: workspace_projects Project creators can delete workspace projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project creators can delete workspace projects" ON public.workspace_projects FOR DELETE USING ((auth.uid() = created_by));


--
-- Name: project_phases Users can create phases for their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create phases for their projects" ON public.project_phases FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_phases.project_id) AND (projects.user_id = auth.uid())))));


--
-- Name: project_reports Users can create reports for their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create reports for their projects" ON public.project_reports FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_reports.project_id) AND (projects.user_id = auth.uid())))));


--
-- Name: conversations Users can create their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own conversations" ON public.conversations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: lesson_chat_history Users can create their own lesson chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own lesson chats" ON public.lesson_chat_history FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_lesson_progress Users can create their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own progress" ON public.user_lesson_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: projects Users can create their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own projects" ON public.projects FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: lesson_sections Users can create their own sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own sections" ON public.lesson_sections FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: workspaces Users can create workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create workspaces" ON public.workspaces FOR INSERT WITH CHECK ((auth.uid() = owner_id));


--
-- Name: chat_history Users can delete their own chat history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own chat history" ON public.chat_history FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: conversations Users can delete their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own conversations" ON public.conversations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: lesson_chat_history Users can delete their own lesson chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own lesson chats" ON public.lesson_chat_history FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_memory Users can delete their own memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own memory" ON public.user_memory FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_lesson_progress Users can delete their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own progress" ON public.user_lesson_progress FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: projects Users can delete their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: lesson_sections Users can delete their own sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own sections" ON public.lesson_sections FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: defense_certificates Users can insert their own certificates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own certificates" ON public.defense_certificates FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_memory Users can insert their own memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own memory" ON public.user_memory FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: chat_history Users can insert their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own messages" ON public.chat_history FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: project_phases Users can update phases of their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update phases of their projects" ON public.project_phases FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_phases.project_id) AND (projects.user_id = auth.uid())))));


--
-- Name: defense_certificates Users can update their own certificates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own certificates" ON public.defense_certificates FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: conversations Users can update their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own conversations" ON public.conversations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: workspace_invitations Users can update their own invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own invitations" ON public.workspace_invitations FOR UPDATE USING ((email = (( SELECT users.email
   FROM auth.users
  WHERE (users.id = auth.uid())))::text));


--
-- Name: user_memory Users can update their own memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own memory" ON public.user_memory FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_lesson_progress Users can update their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own progress" ON public.user_lesson_progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: projects Users can update their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: lesson_sections Users can update their own sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own sections" ON public.lesson_sections FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: workspace_invitations Users can view invitations for their email; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view invitations for their email" ON public.workspace_invitations FOR SELECT USING (((email = (( SELECT users.email
   FROM auth.users
  WHERE (users.id = auth.uid())))::text) OR public.is_workspace_member(auth.uid(), workspace_id)));


--
-- Name: project_phases Users can view phases of their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view phases of their projects" ON public.project_phases FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_phases.project_id) AND (projects.user_id = auth.uid())))));


--
-- Name: project_reports Users can view reports of their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view reports of their projects" ON public.project_reports FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_reports.project_id) AND (projects.user_id = auth.uid())))));


--
-- Name: defense_certificates Users can view their own certificates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own certificates" ON public.defense_certificates FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: chat_history Users can view their own chat history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own chat history" ON public.chat_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: conversations Users can view their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own conversations" ON public.conversations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: lesson_chat_history Users can view their own lesson chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own lesson chats" ON public.lesson_chat_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_memory Users can view their own memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own memory" ON public.user_memory FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_lesson_progress Users can view their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own progress" ON public.user_lesson_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: projects Users can view their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: lesson_sections Users can view their own sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own sections" ON public.lesson_sections FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: workspaces Users can view workspaces they are members of; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view workspaces they are members of" ON public.workspaces FOR SELECT USING ((public.is_workspace_member(auth.uid(), id) OR (owner_id = auth.uid())));


--
-- Name: workspace_members Workspace owners can add members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace owners can add members" ON public.workspace_members FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.workspaces
  WHERE ((workspaces.id = workspace_members.workspace_id) AND (workspaces.owner_id = auth.uid())))) OR (auth.uid() = user_id)));


--
-- Name: workspace_invitations Workspace owners can create invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace owners can create invitations" ON public.workspace_invitations FOR INSERT WITH CHECK ((public.is_workspace_owner(auth.uid(), workspace_id) OR public.is_workspace_member(auth.uid(), workspace_id)));


--
-- Name: workspace_invitations Workspace owners can delete invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace owners can delete invitations" ON public.workspace_invitations FOR DELETE USING (public.is_workspace_owner(auth.uid(), workspace_id));


--
-- Name: workspace_members Workspace owners can remove members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace owners can remove members" ON public.workspace_members FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.workspaces
  WHERE ((workspaces.id = workspace_members.workspace_id) AND (workspaces.owner_id = auth.uid())))));


--
-- Name: chat_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

--
-- Name: conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: defense_certificates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.defense_certificates ENABLE ROW LEVEL SECURITY;

--
-- Name: engineering_lessons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.engineering_lessons ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_chat_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_chat_history ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_sections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: project_phases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;

--
-- Name: project_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: user_lesson_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: user_memory; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_invitations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspace_projects ENABLE ROW LEVEL SECURITY;

--
-- Name: workspaces; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;