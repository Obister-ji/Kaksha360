-- Create tests table
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  instructor TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration TEXT NOT NULL,
  status TEXT NOT NULL,
  participants TEXT[] NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NULL,
  created_by UUID REFERENCES auth.users(id) NULL
);

-- Create test_questions table
CREATE TABLE IF NOT EXISTS public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  subject TEXT NOT NULL,
  image_url TEXT NULL,
  solution TEXT NULL,
  marks INTEGER NULL DEFAULT 4,
  negative_marks INTEGER NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create test_options table
CREATE TABLE IF NOT EXISTS public.test_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.test_questions(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_options ENABLE ROW LEVEL SECURITY;

-- Create policies for tests table
CREATE POLICY "Allow public read access" ON public.tests
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create tests" ON public.tests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own tests" ON public.tests
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Allow users to delete their own tests" ON public.tests
  FOR DELETE USING (auth.uid() = created_by);

-- Create policies for test_questions table
CREATE POLICY "Allow public read access" ON public.test_questions
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create questions" ON public.test_questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update questions" ON public.test_questions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete questions" ON public.test_questions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for test_options table
CREATE POLICY "Allow public read access" ON public.test_options
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create options" ON public.test_options
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update options" ON public.test_options
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete options" ON public.test_options
  FOR DELETE USING (auth.role() = 'authenticated');
