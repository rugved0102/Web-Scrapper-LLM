-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Table to store scraped website content
CREATE TABLE IF NOT EXISTS public.analysis_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL,
  url TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store content embeddings (chunks with vectors)
CREATE TABLE IF NOT EXISTS public.content_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_content_id UUID NOT NULL REFERENCES public.analysis_content(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(384), -- 384 dimensions for all-MiniLM-L6-v2 model
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analysis_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analysis_content
CREATE POLICY "Users can view their own content"
  ON public.analysis_content
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content"
  ON public.analysis_content
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
  ON public.analysis_content
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for content_embeddings
CREATE POLICY "Users can view their own embeddings"
  ON public.content_embeddings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_content
      WHERE analysis_content.id = content_embeddings.analysis_content_id
      AND analysis_content.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own embeddings"
  ON public.content_embeddings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analysis_content
      WHERE analysis_content.id = content_embeddings.analysis_content_id
      AND analysis_content.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own embeddings"
  ON public.content_embeddings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_content
      WHERE analysis_content.id = content_embeddings.analysis_content_id
      AND analysis_content.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_analysis_content_user_id ON public.analysis_content(user_id);
CREATE INDEX idx_analysis_content_analysis_id ON public.analysis_content(analysis_id);
CREATE INDEX idx_content_embeddings_content_id ON public.content_embeddings(analysis_content_id);
CREATE INDEX idx_content_embeddings_vector ON public.content_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);