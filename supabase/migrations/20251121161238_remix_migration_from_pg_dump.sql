CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

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
-- Name: user_memory user_memory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_memory
    ADD CONSTRAINT user_memory_pkey PRIMARY KEY (id);


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
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_conversation_updated_at();


--
-- Name: user_memory update_user_memory_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_memory_timestamp BEFORE UPDATE ON public.user_memory FOR EACH ROW EXECUTE FUNCTION public.update_user_memory_updated_at();


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
-- Name: projects Users can create their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own projects" ON public.projects FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: chat_history Users can delete their own chat history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own chat history" ON public.chat_history FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: conversations Users can delete their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own conversations" ON public.conversations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_memory Users can delete their own memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own memory" ON public.user_memory FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: projects Users can delete their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING ((auth.uid() = user_id));


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
-- Name: user_memory Users can update their own memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own memory" ON public.user_memory FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: projects Users can update their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING ((auth.uid() = user_id));


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
-- Name: user_memory Users can view their own memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own memory" ON public.user_memory FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: projects Users can view their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING ((auth.uid() = user_id));


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
-- Name: user_memory; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


