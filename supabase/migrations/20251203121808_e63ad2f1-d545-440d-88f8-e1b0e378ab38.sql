-- Create being_state table to persist the being's emotional state per user
CREATE TABLE public.being_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  k DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  v DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  a DOUBLE PRECISION NOT NULL DEFAULT 0.3,
  h DOUBLE PRECISION NOT NULL DEFAULT 0.4,
  i DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  c DOUBLE PRECISION NOT NULL DEFAULT 0.6,
  u DOUBLE PRECISION NOT NULL DEFAULT 0.3,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.being_state ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own being state" 
ON public.being_state 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own being state" 
ON public.being_state 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own being state" 
ON public.being_state 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_being_state_updated_at
BEFORE UPDATE ON public.being_state
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();