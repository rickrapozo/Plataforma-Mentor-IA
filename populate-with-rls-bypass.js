// Script para popular o banco de dados contornando RLS temporariamente
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados de exemplo para popular o banco
const sampleVideos = [
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'Audiobook: Como Desenvolver Sua Mente',
    description: 'Um audiobook completo sobre desenvolvimento pessoal e mental.',
    thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channel_title: 'Canal de Audiobooks',
    duration: 3600,
    view_count: 50000,
    like_count: 1200,
    published_at: '2024-01-15T10:00:00Z',
    category: 'audiobook',
    tags: ['desenvolvimento pessoal', 'audiobook', 'mente']
  },
  {
    video_id: 'abc123def456',
    title: 'Podcast: Frequências dos Mestres - Episódio 1',
    description: 'Primeiro episódio do podcast sobre frequências e desenvolvimento espiritual.',
    thumbnail_url: 'https://img.youtube.com/vi/abc123def456/maxresdefault.jpg',
    channel_title: 'Frequências dos Mestres',
    duration: 2400,
    view_count: 25000,
    like_count: 800,
    published_at: '2024-01-20T15:30:00Z',
    category: 'podcast',
    tags: ['podcast', 'frequências', 'mestres', 'espiritualidade']
  },
  {
    video_id: 'xyz789uvw012',
    title: 'Palestra: A Ciência da Meditação',
    description: 'Palestra científica sobre os benefícios da meditação para o cérebro.',
    thumbnail_url: 'https://img.youtube.com/vi/xyz789uvw012/maxresdefault.jpg',
    channel_title: 'Ciência e Consciência',
    duration: 5400,
    view_count: 75000,
    like_count: 2100,
    published_at: '2024-01-25T09:15:00Z',
    category: 'lecture',
    tags: ['palestra', 'meditação', 'ciência', 'cérebro']
  }
];

async function populateDatabase() {
  try {
    console.log('Iniciando população do banco de dados...');
    
    // Primeiro, vamos tentar desabilitar RLS temporariamente usando SQL direto
    console.log('Tentando inserir dados usando SQL direto...');
    
    for (const video of sampleVideos) {
      const { data, error } = await supabase.rpc('insert_youtube_video', {
        p_video_id: video.video_id,
        p_title: video.title,
        p_description: video.description,
        p_thumbnail_url: video.thumbnail_url,
        p_channel_title: video.channel_title,
        p_duration: video.duration,
        p_view_count: video.view_count,
        p_like_count: video.like_count,
        p_published_at: video.published_at,
        p_category: video.category,
        p_tags: video.tags
      });
      
      if (error) {
        console.log(`Erro ao inserir vídeo ${video.video_id}:`, error.message);
        
        // Se a função RPC não existir, vamos tentar inserção direta
        console.log('Tentando inserção direta...');
        const { data: directData, error: directError } = await supabase
          .from('youtube_videos')
          .insert([video]);
        
        if (directError) {
          console.error(`Erro na inserção direta do vídeo ${video.video_id}:`, directError.message);
        } else {
          console.log(`Vídeo ${video.video_id} inserido com sucesso via inserção direta!`);
        }
      } else {
        console.log(`Vídeo ${video.video_id} inserido com sucesso via RPC!`);
      }
    }
    
    // Verificar se os dados foram inseridos
    const { data: videos, error: selectError } = await supabase
      .from('youtube_videos')
      .select('*');
    
    if (selectError) {
      console.error('Erro ao buscar vídeos:', selectError.message);
      return;
    }
    
    console.log(`\nTotal de vídeos no banco: ${videos.length}`);
    
    if (videos.length > 0) {
      // Contar por categoria
      const categories = ['audiobook', 'podcast', 'lecture'];
      for (const category of categories) {
        const categoryVideos = videos.filter(v => v.category === category);
        console.log(`${category}: ${categoryVideos.length} vídeos`);
      }
      
      console.log('\nVídeos encontrados:');
      videos.forEach(video => {
        console.log(`- ${video.title} (${video.category})`);
      });
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

populateDatabase();