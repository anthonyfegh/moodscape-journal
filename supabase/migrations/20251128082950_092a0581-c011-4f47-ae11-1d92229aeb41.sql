-- Add type column to journals table to support different journal types
ALTER TABLE public.journals 
ADD COLUMN type text DEFAULT 'daily';

-- Add type column to sub_journals table
ALTER TABLE public.sub_journals 
ADD COLUMN type text DEFAULT 'daily';

-- Make user_id nullable since we're allowing public access without authentication
ALTER TABLE public.journals 
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.sub_journals 
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.moments 
ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing restrictive RLS policies
DROP POLICY IF EXISTS "Users can view own journals" ON public.journals;
DROP POLICY IF EXISTS "Users can create own journals" ON public.journals;
DROP POLICY IF EXISTS "Users can update own journals" ON public.journals;
DROP POLICY IF EXISTS "Users can delete own journals" ON public.journals;

DROP POLICY IF EXISTS "Users can view own sub-journals" ON public.sub_journals;
DROP POLICY IF EXISTS "Users can create own sub-journals" ON public.sub_journals;
DROP POLICY IF EXISTS "Users can update own sub-journals" ON public.sub_journals;
DROP POLICY IF EXISTS "Users can delete own sub-journals" ON public.sub_journals;

DROP POLICY IF EXISTS "Users can view own moments" ON public.moments;
DROP POLICY IF EXISTS "Users can create own moments" ON public.moments;
DROP POLICY IF EXISTS "Users can update own moments" ON public.moments;
DROP POLICY IF EXISTS "Users can delete own moments" ON public.moments;

-- Create new public access policies
CREATE POLICY "Public can view all journals" 
ON public.journals FOR SELECT 
USING (true);

CREATE POLICY "Public can create journals" 
ON public.journals FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update journals" 
ON public.journals FOR UPDATE 
USING (true);

CREATE POLICY "Public can delete journals" 
ON public.journals FOR DELETE 
USING (true);

CREATE POLICY "Public can view all sub-journals" 
ON public.sub_journals FOR SELECT 
USING (true);

CREATE POLICY "Public can create sub-journals" 
ON public.sub_journals FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update sub-journals" 
ON public.sub_journals FOR UPDATE 
USING (true);

CREATE POLICY "Public can delete sub-journals" 
ON public.sub_journals FOR DELETE 
USING (true);

CREATE POLICY "Public can view all moments" 
ON public.moments FOR SELECT 
USING (true);

CREATE POLICY "Public can create moments" 
ON public.moments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update moments" 
ON public.moments FOR UPDATE 
USING (true);

CREATE POLICY "Public can delete moments" 
ON public.moments FOR DELETE 
USING (true);