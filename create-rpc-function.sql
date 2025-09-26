-- Função RPC para inserir vídeos do YouTube contornando RLS
CREATE OR REPLACE FUNCTION insert_youtube_video(
  p_video_id TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_thumbnail_url TEXT DEFAULT NULL,
  p_channel_title TEXT DEFAULT NULL,
  p_duration INTEGER DEFAULT NULL,
  p_view_count BIGINT DEFAULT NULL,
  p_like_count BIGINT DEFAULT NULL,
  p_published_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_category TEXT DEFAULT 'audiobook',
  p_tags TEXT[] DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.youtube_videos (
    video_id,
    title,
    description,
    thumbnail_url,
    channel_title,
    duration,
    view_count,
    like_count,
    published_at,
    category,
    tags
  ) VALUES (
    p_video_id,
    p_title,
    p_description,
    p_thumbnail_url,
    p_channel_title,
    p_duration,
    p_view_count,
    p_like_count,
    p_published_at,
    p_category,
    p_tags
  ) RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Dar permissão para usuários autenticados executarem a função
GRANT EXECUTE ON FUNCTION insert_youtube_video TO authenticated;
GRANT EXECUTE ON FUNCTION insert_youtube_video TO anon;