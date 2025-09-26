import { supabase } from '@/integrations/supabase/client';

// Interface para dados de vídeo no banco de dados
interface VideoData {
  video_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  channel_title: string;
  duration: string;
  view_count: number;
  like_count: number;
  published_at: string;
  category: 'audiobook' | 'podcast' | 'lecture';
  tags: string[];
}

class YouTubeService {
  /**
   * Busca vídeos do banco de dados por categoria
   */
  public async getVideosByCategory(category: 'audiobook' | 'podcast' | 'lecture'): Promise<VideoData[]> {
    try {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('category', category)
        .order('view_count', { ascending: false })
        .limit(50);

      if (error) {
        console.error(`Erro ao buscar vídeos da categoria ${category}:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar vídeos da categoria ${category}:`, error);
      return [];
    }
  }

  /**
   * Verifica status das atualizações
   */
  public async getUpdateStatus(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('youtube_api_updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar status das atualizações:', error);
      return [];
    }
  }
}

// Instância singleton do serviço
export const youtubeService = new YouTubeService();
export default youtubeService;