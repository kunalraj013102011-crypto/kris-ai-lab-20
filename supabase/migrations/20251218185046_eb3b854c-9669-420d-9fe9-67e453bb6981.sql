-- Create engineering_lessons table to store available lessons
CREATE TABLE public.engineering_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_lesson_progress table to track user progress
CREATE TABLE public.user_lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID REFERENCES public.engineering_lessons(id) ON DELETE CASCADE,
  custom_topic TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress',
  ai_content TEXT,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson_chat_history table for lesson-specific conversations
CREATE TABLE public.lesson_chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_progress_id UUID REFERENCES public.user_lesson_progress(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.engineering_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_chat_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for engineering_lessons (public read)
CREATE POLICY "Anyone can view lessons"
ON public.engineering_lessons
FOR SELECT
USING (true);

-- RLS policies for user_lesson_progress
CREATE POLICY "Users can view their own progress"
ON public.user_lesson_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
ON public.user_lesson_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_lesson_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
ON public.user_lesson_progress
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for lesson_chat_history
CREATE POLICY "Users can view their own lesson chats"
ON public.lesson_chat_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lesson chats"
ON public.lesson_chat_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lesson chats"
ON public.lesson_chat_history
FOR DELETE
USING (auth.uid() = user_id);

-- Insert default engineering lessons
INSERT INTO public.engineering_lessons (title, category, description, difficulty) VALUES
('Circuit Analysis Fundamentals', 'Electronics', 'Learn Ohm''s Law, Kirchhoff''s Laws, and basic circuit analysis techniques', 'beginner'),
('Operational Amplifiers', 'Electronics', 'Deep dive into op-amp configurations, applications, and design', 'intermediate'),
('Digital Logic Design', 'Electronics', 'Boolean algebra, logic gates, and combinational circuit design', 'beginner'),
('Microcontroller Programming', 'Embedded Systems', 'Introduction to microcontrollers, GPIO, interrupts, and timers', 'intermediate'),
('Sensor Integration', 'Embedded Systems', 'Working with various sensors: temperature, pressure, accelerometers', 'intermediate'),
('Control Systems Theory', 'Control Engineering', 'PID controllers, stability analysis, and feedback systems', 'advanced'),
('Signal Processing Basics', 'Signal Processing', 'Fourier analysis, filters, and signal conditioning', 'intermediate'),
('PCB Design Principles', 'Electronics', 'Schematic capture, layout rules, and manufacturing considerations', 'intermediate'),
('Power Electronics', 'Electronics', 'Switching regulators, inverters, and power management', 'advanced'),
('Machine Learning for Engineers', 'AI/ML', 'Neural networks, model training, and engineering applications', 'advanced'),
('Computer Vision Fundamentals', 'AI/ML', 'Image processing, object detection, and visual recognition', 'advanced'),
('Robotics Kinematics', 'Robotics', 'Forward and inverse kinematics, motion planning', 'advanced'),
('Motor Control Systems', 'Robotics', 'DC, stepper, and servo motor control techniques', 'intermediate'),
('Communication Protocols', 'Embedded Systems', 'I2C, SPI, UART, CAN bus, and wireless protocols', 'intermediate'),
('3D Printing & Additive Manufacturing', 'Manufacturing', 'Design for 3D printing, materials, and optimization', 'beginner');