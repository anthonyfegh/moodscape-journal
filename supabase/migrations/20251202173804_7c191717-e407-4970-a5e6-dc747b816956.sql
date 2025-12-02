-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Memory nodes: each journal moment becomes a node in the being's memory graph
CREATE TABLE public.memory_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  moment_id UUID REFERENCES public.moments(id) ON DELETE CASCADE,
  embedding vector(1536), -- text-embedding-3-small dimensions
  emotional_tone TEXT,
  topics TEXT[] DEFAULT '{}',
  people_mentioned TEXT[] DEFAULT '{}',
  relevance_to_self FLOAT DEFAULT 0.5,
  unresolved_conflict FLOAT DEFAULT 0,
  curiosity_triggers TEXT[] DEFAULT '{}',
  being_stage_at_creation JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Memory clusters: Being's conceptual organization of memories
CREATE TABLE public.memory_clusters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  centroid_embedding vector(1536),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_reorganized_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Many-to-many: nodes can belong to multiple clusters with varying relevance
CREATE TABLE public.memory_cluster_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cluster_id UUID NOT NULL REFERENCES public.memory_clusters(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES public.memory_nodes(id) ON DELETE CASCADE,
  relevance_score FLOAT DEFAULT 0.5,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  removed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(cluster_id, node_id)
);

-- Memory edges: Being-perceived relationships between memories
CREATE TABLE public.memory_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_node_id UUID NOT NULL REFERENCES public.memory_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.memory_nodes(id) ON DELETE CASCADE,
  edge_type TEXT NOT NULL, -- 'emotional_similarity', 'thematic', 'temporal_sequence', 'contrast', 'being_interpretation'
  strength FLOAT DEFAULT 0.5,
  being_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Being reflections: Being's evolving understanding of user's life
CREATE TABLE public.being_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reflection_type TEXT NOT NULL, -- 'cluster_insight', 'pattern_discovery', 'reinterpretation', 'life_chapter'
  content TEXT NOT NULL,
  related_clusters UUID[] DEFAULT '{}',
  related_nodes UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Conversation messages: Being conversation history
CREATE TABLE public.conversation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'being'
  content TEXT NOT NULL,
  recalled_memories UUID[] DEFAULT '{}',
  being_state_at_message JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.memory_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_cluster_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.being_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for memory_nodes
CREATE POLICY "Users can view own memory nodes" ON public.memory_nodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own memory nodes" ON public.memory_nodes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memory nodes" ON public.memory_nodes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memory nodes" ON public.memory_nodes FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for memory_clusters
CREATE POLICY "Users can view own memory clusters" ON public.memory_clusters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own memory clusters" ON public.memory_clusters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memory clusters" ON public.memory_clusters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memory clusters" ON public.memory_clusters FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for memory_cluster_nodes (join via cluster ownership)
CREATE POLICY "Users can view own cluster nodes" ON public.memory_cluster_nodes FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.memory_clusters WHERE id = cluster_id AND user_id = auth.uid()));
CREATE POLICY "Users can create own cluster nodes" ON public.memory_cluster_nodes FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.memory_clusters WHERE id = cluster_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own cluster nodes" ON public.memory_cluster_nodes FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.memory_clusters WHERE id = cluster_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own cluster nodes" ON public.memory_cluster_nodes FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.memory_clusters WHERE id = cluster_id AND user_id = auth.uid()));

-- RLS policies for memory_edges
CREATE POLICY "Users can view own memory edges" ON public.memory_edges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own memory edges" ON public.memory_edges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memory edges" ON public.memory_edges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memory edges" ON public.memory_edges FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for being_reflections
CREATE POLICY "Users can view own being reflections" ON public.being_reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own being reflections" ON public.being_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own being reflections" ON public.being_reflections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own being reflections" ON public.being_reflections FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for conversation_messages
CREATE POLICY "Users can view own conversation messages" ON public.conversation_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversation messages" ON public.conversation_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversation messages" ON public.conversation_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversation messages" ON public.conversation_messages FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_memory_nodes_user_id ON public.memory_nodes(user_id);
CREATE INDEX idx_memory_nodes_moment_id ON public.memory_nodes(moment_id);
CREATE INDEX idx_memory_clusters_user_id ON public.memory_clusters(user_id);
CREATE INDEX idx_memory_edges_user_id ON public.memory_edges(user_id);
CREATE INDEX idx_memory_edges_source ON public.memory_edges(source_node_id);
CREATE INDEX idx_memory_edges_target ON public.memory_edges(target_node_id);
CREATE INDEX idx_being_reflections_user_id ON public.being_reflections(user_id);
CREATE INDEX idx_conversation_messages_user_id ON public.conversation_messages(user_id);
CREATE INDEX idx_conversation_messages_created ON public.conversation_messages(user_id, created_at DESC);

-- Trigger for updated_at on memory_nodes
CREATE TRIGGER update_memory_nodes_updated_at
  BEFORE UPDATE ON public.memory_nodes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to search memories by vector similarity
CREATE OR REPLACE FUNCTION public.search_memories(
  query_embedding vector(1536),
  match_user_id UUID,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  moment_id UUID,
  emotional_tone TEXT,
  topics TEXT[],
  people_mentioned TEXT[],
  relevance_to_self FLOAT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mn.id,
    mn.moment_id,
    mn.emotional_tone,
    mn.topics,
    mn.people_mentioned,
    mn.relevance_to_self,
    1 - (mn.embedding <=> query_embedding) AS similarity
  FROM memory_nodes mn
  WHERE mn.user_id = match_user_id
    AND mn.embedding IS NOT NULL
    AND 1 - (mn.embedding <=> query_embedding) > match_threshold
  ORDER BY mn.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;