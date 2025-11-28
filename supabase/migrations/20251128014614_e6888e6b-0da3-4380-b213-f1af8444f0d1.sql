-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create journals table
CREATE TABLE public.journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  last_mood_color TEXT DEFAULT '#FCD34D',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on journals
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

-- Journals policies
CREATE POLICY "Users can view own journals"
  ON public.journals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journals"
  ON public.journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journals"
  ON public.journals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journals"
  ON public.journals FOR DELETE
  USING (auth.uid() = user_id);

-- Create sub_journals table
CREATE TABLE public.sub_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on sub_journals
ALTER TABLE public.sub_journals ENABLE ROW LEVEL SECURITY;

-- Sub-journals policies
CREATE POLICY "Users can view own sub-journals"
  ON public.sub_journals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sub-journals"
  ON public.sub_journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sub-journals"
  ON public.sub_journals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sub-journals"
  ON public.sub_journals FOR DELETE
  USING (auth.uid() = user_id);

-- Create moments table
CREATE TABLE public.moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_journal_id UUID NOT NULL REFERENCES public.sub_journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  emotion TEXT,
  color TEXT DEFAULT '#FCD34D',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on moments
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;

-- Moments policies
CREATE POLICY "Users can view own moments"
  ON public.moments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own moments"
  ON public.moments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own moments"
  ON public.moments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own moments"
  ON public.moments FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_journals_user_id ON public.journals(user_id);
CREATE INDEX idx_sub_journals_journal_id ON public.sub_journals(journal_id);
CREATE INDEX idx_sub_journals_user_id ON public.sub_journals(user_id);
CREATE INDEX idx_moments_sub_journal_id ON public.moments(sub_journal_id);
CREATE INDEX idx_moments_user_id ON public.moments(user_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_journals_updated_at
  BEFORE UPDATE ON public.journals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sub_journals_updated_at
  BEFORE UPDATE ON public.sub_journals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();