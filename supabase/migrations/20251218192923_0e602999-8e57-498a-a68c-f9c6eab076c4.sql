-- Create lesson_sections table to store expandable section content
CREATE TABLE public.lesson_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_progress_id UUID REFERENCES public.user_lesson_progress(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  section_id TEXT NOT NULL,
  section_title TEXT NOT NULL,
  summary TEXT,
  full_content TEXT,
  is_expanded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lesson_progress_id, section_id)
);

-- Enable RLS
ALTER TABLE public.lesson_sections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own sections"
ON public.lesson_sections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sections"
ON public.lesson_sections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sections"
ON public.lesson_sections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sections"
ON public.lesson_sections FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_lesson_sections_updated_at
BEFORE UPDATE ON public.lesson_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_user_memory_updated_at();