// Script para popular o banco de dados com dados de exemplo
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
    channel_id: 'UC123456789',
    duration: 3600,
    view_count: 50000,
    like_count: 1200,
    comment_count: 150,
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
    channel_id: 'UC987654321',
    duration: 2400,
    view_count: 25000,
    like_count: 800,
    comment_count: 95,
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
    channel_id: 'UC456789123',
    duration: 5400,
    view_count: 75000,
    like_count: 2100,
    comment_count: 320,
    published_at: '2024-01-25T09:15:00Z',
    category: 'lecture',
    tags: ['palestra', 'meditação', 'ciência', 'cérebro']
  }
];

async function populateDatabase() {
  try {
    console.log('Iniciando população do banco de dados...');
    
    // Inserir vídeos de exemplo
    const { data, error } = await supabase
      .from('youtube_videos')
      .insert(sampleVideos);
    
    if (error) {
      console.error('Erro ao inserir vídeos:', error);
      return;
    }
    
    console.log('Vídeos inseridos com sucesso!');
    
    // Verificar se os dados foram inseridos
    const { data: videos, error: selectError } = await supabase
      .from('youtube_videos')
      .select('*');
    
    if (selectError) {
      console.error('Erro ao buscar vídeos:', selectError);
      return;
    }
    
    console.log(`Total de vídeos no banco: ${videos.length}`);
    
    // Contar por categoria
    const categories = ['audiobook', 'podcast', 'lecture'];
    for (const category of categories) {
      const categoryVideos = videos.filter(v => v.category === category);
      console.log(`${category}: ${categoryVideos.length} vídeos`);
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

populateDatabase();