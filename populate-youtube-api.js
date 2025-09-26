// Script para buscar vídeos reais da API do YouTube e popular o banco de dados
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://miwxirnutduprdyqngkh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd3hpcm51dGR1cHJkeXFuZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzQ5MTAsImV4cCI6MjA3NDI1MDkxMH0.sNX0dzpUuN2TVeay87nEs3aCYk74I_nHO_MSWBzw94o';

// Chave da API do YouTube
const youtubeApiKey = 'AIzaSyD5gygjyhPz2UrDbm8h9WS-r8yzpqag5r4';

const supabase = createClient(supabaseUrl, supabaseKey);

// Termos de busca para cada categoria
const searchTerms = {
  audiobook: ['audiobook', 'audio book', 'livro falado', 'narração'],
  podcast: ['podcast', 'entrevista', 'conversa', 'bate-papo'],
  lecture: ['palestra', 'aula', 'conferência', 'apresentação', 'lecture']
};

// Função para buscar vídeos do YouTube
async function searchYouTubeVideos(query, maxResults = 5) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${youtubeApiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error('Erro na API do YouTube:', data.error);
      return [];
    }
    
    return data.items || [];
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    return [];
  }
}

// Função para obter detalhes do vídeo
async function getVideoDetails(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${youtubeApiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0];
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter detalhes do vídeo:', error);
    return null;
  }
}

// Função para converter duração ISO 8601 para segundos
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Função para inserir vídeo no banco de dados
async function insertVideo(videoData, category) {
  try {
    const { data, error } = await supabase
      .from('youtube_videos')
      .insert([{
        video_id: videoData.id,
        title: videoData.snippet.title,
        description: videoData.snippet.description,
        thumbnail_url: videoData.snippet.thumbnails.medium?.url || videoData.snippet.thumbnails.default?.url,
        channel_title: videoData.snippet.channelTitle,
        channel_id: videoData.snippet.channelId,
        duration: parseDuration(videoData.contentDetails.duration),
        view_count: parseInt(videoData.statistics.viewCount || 0),
        like_count: parseInt(videoData.statistics.likeCount || 0),
        comment_count: parseInt(videoData.statistics.commentCount || 0),
        published_at: videoData.snippet.publishedAt,
        category: category,
        tags: videoData.snippet.tags ? videoData.snippet.tags.slice(0, 10) : []
      }]);

    if (error) {
      console.error(`Erro ao inserir vídeo ${videoData.id}:`, error);
      return false;
    }
    
    console.log(`✅ Vídeo inserido: ${videoData.snippet.title}`);
    return true;
  } catch (error) {
    console.error(`Erro ao inserir vídeo ${videoData.id}:`, error);
    return false;
  }
}

// Função principal para popular o banco de dados
async function populateDatabase() {
  console.log('🚀 Iniciando população do banco de dados com vídeos do YouTube...');
  
  let totalInserted = 0;
  
  for (const [category, terms] of Object.entries(searchTerms)) {
    console.log(`\n📂 Processando categoria: ${category}`);
    
    for (const term of terms) {
      console.log(`🔍 Buscando por: "${term}"`);
      
      const searchResults = await searchYouTubeVideos(term, 3);
      
      for (const item of searchResults) {
        const videoDetails = await getVideoDetails(item.id.videoId);
        
        if (videoDetails) {
          const success = await insertVideo(videoDetails, category);
          if (success) {
            totalInserted++;
          }
        }
        
        // Pequena pausa para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  console.log(`\n✅ Processo concluído! Total de vídeos inseridos: ${totalInserted}`);
  
  // Verificar contagem por categoria
  for (const category of Object.keys(searchTerms)) {
    const { count } = await supabase
      .from('youtube_videos')
      .select('*', { count: 'exact', head: true })
      .eq('category', category);
    
    console.log(`📊 ${category}: ${count} vídeos`);
  }
}

// Executar o script
populateDatabase().catch(console.error);