-- Update RLS policies to scope data to authenticated users

-- Drop existing public policies for journals
DROP POLICY IF EXISTS "Public can view all journals" ON public.journals;
DROP POLICY IF EXISTS "Public can create journals" ON public.journals;
DROP POLICY IF EXISTS "Public can update journals" ON public.journals;
DROP POLICY IF EXISTS "Public can delete journals" ON public.journals;

-- Create user-scoped policies for journals
CREATE POLICY "Users can view own journals"
  ON public.journals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journals"
  ON public.journals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journals"
  ON public.journals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journals"
  ON public.journals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing public policies for sub_journals
DROP POLICY IF EXISTS "Public can view all sub-journals" ON public.sub_journals;
DROP POLICY IF EXISTS "Public can create sub-journals" ON public.sub_journals;
DROP POLICY IF EXISTS "Public can update sub-journals" ON public.sub_journals;
DROP POLICY IF EXISTS "Public can delete sub-journals" ON public.sub_journals;

-- Create user-scoped policies for sub_journals
CREATE POLICY "Users can view own sub-journals"
  ON public.sub_journals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sub-journals"
  ON public.sub_journals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sub-journals"
  ON public.sub_journals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sub-journals"
  ON public.sub_journals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing public policies for moments
DROP POLICY IF EXISTS "Public can view all moments" ON public.moments;
DROP POLICY IF EXISTS "Public can create moments" ON public.moments;
DROP POLICY IF EXISTS "Public can update moments" ON public.moments;
DROP POLICY IF EXISTS "Public can delete moments" ON public.moments;

-- Create user-scoped policies for moments
CREATE POLICY "Users can view own moments"
  ON public.moments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own moments"
  ON public.moments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own moments"
  ON public.moments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own moments"
  ON public.moments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);