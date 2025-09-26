-- Migração para integração com YouTube API v3
-- Criada em: 2025-01-27

-- Tabela para armazenar vídeos do YouTube por categoria
CREATE TABLE public.youtube_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL UNIQUE, -- ID do vídeo no YouTube
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  channel_title TEXT,
  duration TEXT, -- Formato ISO 8601 (PT4M13S)
  view_count BIGINT,
  like_count BIGINT,
  published_at TIMESTAMP WITH TIME ZONE,
  category TEXT NOT NULL CHECK (category IN ('audiobook', 'podcast', 'lecture')),
  tags TEXT[], -- Array de tags para busca
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para controlar atualizações da API do YouTube
CREATE TABLE public.youtube_api_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('audiobook', 'podcast', 'lecture')),
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  videos_fetched INTEGER DEFAULT 0,
  api_quota_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'in_progress')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para otimização de consultas
CREATE INDEX idx_youtube_videos_category ON public.youtube_videos(category);
CREATE INDEX idx_youtube_videos_published_at ON public.youtube_videos(published_at DESC);
CREATE INDEX idx_youtube_videos_view_count ON public.youtube_videos(view_count DESC);
CREATE INDEX idx_youtube_api_updates_category ON public.youtube_api_updates(category);
CREATE INDEX idx_youtube_api_updates_last_update ON public.youtube_api_updates(last_update DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_api_updates ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança - Todos os usuários autenticados podem visualizar
CREATE POLICY "Authenticated users can view youtube videos" 
ON public.youtube_videos 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view api updates" 
ON public.youtube_api_updates 
FOR SELECT 
TO authenticated
USING (true);

-- Apenas administradores podem inserir/atualizar (será controlado pelo backend)
CREATE POLICY "Service role can manage youtube videos" 
ON public.youtube_videos 
FOR ALL 
TO service_role
USING (true);

CREATE POLICY "Service role can manage api updates" 
ON public.youtube_api_updates 
FOR ALL 
TO service_role
USING (true);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela youtube_videos
CREATE TRIGGER update_youtube_videos_updated_at 
    BEFORE UPDATE ON public.youtube_videos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir registros iniciais para controle de atualizações
INSERT INTO public.youtube_api_updates (category, last_update, videos_fetched, status) VALUES
('audiobook', '2025-01-01 00:00:00+00', 0, 'success'),
('podcast', '2025-01-01 00:00:00+00', 0, 'success'),
('lecture', '2025-01-01 00:00:00+00', 0, 'success');

-- Comentários para documentação
COMMENT ON TABLE public.youtube_videos IS 'Armazena vídeos do YouTube categorizados para o Arsenal Mental';
COMMENT ON TABLE public.youtube_api_updates IS 'Controla atualizações e uso de quota da API do YouTube';
COMMENT ON COLUMN public.youtube_videos.video_id IS 'ID único do vídeo no YouTube';
COMMENT ON COLUMN public.youtube_videos.category IS 'Categoria: audiobook, podcast ou lecture';
COMMENT ON COLUMN public.youtube_videos.duration IS 'Duração no formato ISO 8601 (ex: PT4M13S)';
COMMENT ON COLUMN public.youtube_api_updates.api_quota_used IS 'Quota da API utilizada na última atualização';