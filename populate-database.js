// Script para popular o banco de dados com vídeos do YouTube
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://miwxirnutduprdyqngkh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd3hpcm51dGR1cHJkeXFuZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzQ5MTAsImV4cCI6MjA3NDI1MDkxMH0.sNX0dzpUuN2TVeay87nEs3aCYk74I_nHO_MSWBzw94o';
const youtubeApiKey = 'AIzaSyBJKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK'; // Substitua pela sua chave real

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados de exemplo para popular o banco
const sampleVideos = [
  // Audiobooks
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'O Poder do Hábito - Audiobook Completo',
    description: 'Audiobook completo sobre como formar hábitos positivos e quebrar os negativos.',
    thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channel_title: 'Audiobooks Brasil',
    channel_id: 'UC123456789',
    duration: 9015,
    view_count: 150000,
    like_count: 8500,
    comment_count: 450,
    published_at: '2024-01-15T10:00:00Z',
    category: 'audiobook',
    tags: ['desenvolvimento pessoal', 'hábitos', 'produtividade']
  },
  {
    video_id: 'abc123def456',
    title: 'Mindset - A Nova Psicologia do Sucesso',
    description: 'Audiobook sobre mentalidade de crescimento vs mentalidade fixa.',
    thumbnail_url: 'https://i.ytimg.com/vi/abc123def456/maxresdefault.jpg',
    channel_title: 'Livros em Áudio',
    channel_id: 'UC987654321',
    duration: 'PT3H15M22S',
    view_count: 89000,
    like_count: 5200,
    comment_count: 320,
    published_at: '2024-02-10T14:30:00Z',
    category: 'audiobook',
    tags: ['psicologia', 'sucesso', 'mentalidade']
  },
  {
    video_id: 'xyz789uvw012',
    title: 'Inteligência Emocional - Daniel Goleman',
    description: 'Audiobook completo sobre inteligência emocional e suas aplicações.',
    thumbnail_url: 'https://i.ytimg.com/vi/xyz789uvw012/maxresdefault.jpg',
    channel_title: 'Psicologia em Áudio',
    channel_id: 'UC456789123',
    duration: 'PT4H05M18S',
    view_count: 125000,
    like_count: 7800,
    comment_count: 580,
    published_at: '2024-01-28T09:15:00Z',
    category: 'audiobook',
    tags: ['inteligência emocional', 'psicologia', 'relacionamentos']
  },

  // Podcasts
  {
    video_id: 'pod123abc456',
    title: 'Como Desenvolver Disciplina Mental - Podcast',
    description: 'Episódio sobre técnicas para desenvolver disciplina e foco mental.',
    thumbnail_url: 'https://i.ytimg.com/vi/pod123abc456/maxresdefault.jpg',
    channel_title: 'Mente Forte Podcast',
    channel_id: 'UC111222333',
    duration: 'PT45M30S',
    view_count: 45000,
    like_count: 2800,
    comment_count: 180,
    published_at: '2024-03-05T16:00:00Z',
    category: 'podcast',
    tags: ['disciplina', 'foco', 'produtividade']
  },
  {
    video_id: 'pod789xyz123',
    title: 'Meditação e Mindfulness na Prática',
    description: 'Conversa sobre os benefícios da meditação e como implementar no dia a dia.',
    thumbnail_url: 'https://i.ytimg.com/vi/pod789xyz123/maxresdefault.jpg',
    channel_title: 'Bem-Estar Mental',
    channel_id: 'UC444555666',
    duration: 'PT52M15S',
    view_count: 67000,
    like_count: 4100,
    comment_count: 250,
    published_at: '2024-02-20T11:30:00Z',
    category: 'podcast',
    tags: ['meditação', 'mindfulness', 'bem-estar']
  },
  {
    video_id: 'pod456def789',
    title: 'Gestão do Tempo e Prioridades',
    description: 'Estratégias eficazes para gerenciar tempo e definir prioridades.',
    thumbnail_url: 'https://i.ytimg.com/vi/pod456def789/maxresdefault.jpg',
    channel_title: 'Produtividade Total',
    channel_id: 'UC777888999',
    duration: 'PT38M42S',
    view_count: 32000,
    like_count: 1900,
    comment_count: 120,
    published_at: '2024-03-12T13:45:00Z',
    category: 'podcast',
    tags: ['gestão do tempo', 'prioridades', 'organização']
  },

  // Lectures
  {
    video_id: 'lec123abc789',
    title: 'Neuroplasticidade: Como o Cérebro se Adapta',
    description: 'Palestra sobre neuroplasticidade e como podemos treinar nosso cérebro.',
    thumbnail_url: 'https://i.ytimg.com/vi/lec123abc789/maxresdefault.jpg',
    channel_title: 'Ciência da Mente',
    channel_id: 'UC123789456',
    duration: 'PT1H25M33S',
    view_count: 98000,
    like_count: 6200,
    comment_count: 380,
    published_at: '2024-01-22T15:20:00Z',
    category: 'lecture',
    tags: ['neuroplasticidade', 'cérebro', 'aprendizado']
  },
  {
    video_id: 'lec456def012',
    title: 'Psicologia Positiva e Felicidade',
    description: 'Conferência sobre os fundamentos científicos da felicidade.',
    thumbnail_url: 'https://i.ytimg.com/vi/lec456def012/maxresdefault.jpg',
    channel_title: 'Psicologia Aplicada',
    channel_id: 'UC654321987',
    duration: 'PT1H12M45S',
    view_count: 76000,
    like_count: 4800,
    comment_count: 290,
    published_at: '2024-02-08T10:00:00Z',
    category: 'lecture',
    tags: ['psicologia positiva', 'felicidade', 'bem-estar']
  },
  {
    video_id: 'lec789ghi345',
    title: 'Técnicas de Memorização e Aprendizado',
    description: 'Palestra sobre métodos científicos para melhorar a memória.',
    thumbnail_url: 'https://i.ytimg.com/vi/lec789ghi345/maxresdefault.jpg',
    channel_title: 'Aprendizado Eficaz',
    channel_id: 'UC987123654',
    duration: 'PT1H38M20S',
    view_count: 112000,
    like_count: 7500,
    comment_count: 420,
    published_at: '2024-03-01T14:15:00Z',
    category: 'lecture',
    tags: ['memorização', 'aprendizado', 'técnicas de estudo']
  }
];

async function populateDatabase() {
  console.log('🚀 Iniciando população do banco de dados...');
  
  try {
    // Limpar dados existentes (opcional)
    console.log('🧹 Limpando dados existentes...');
    const { error: deleteError } = await supabase
      .from('youtube_videos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta todos os registros
    
    if (deleteError) {
      console.warn('⚠️ Aviso ao limpar dados:', deleteError.message);
    }
    
    // Inserir vídeos de exemplo
    console.log('📥 Inserindo vídeos de exemplo...');
    const { data, error } = await supabase
      .from('youtube_videos')
      .insert(sampleVideos)
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir vídeos:', error.message);
      return;
    }
    
    console.log(`✅ ${data.length} vídeos inseridos com sucesso!`);
    
    // Verificar inserção por categoria
    const categories = ['audiobook', 'podcast', 'lecture'];
    for (const category of categories) {
      const { count } = await supabase
        .from('youtube_videos')
        .select('*', { count: 'exact' })
        .eq('category', category);
      
      console.log(`📊 ${category}: ${count} vídeos`);
    }
    
    console.log('🎉 Banco de dados populado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

populateDatabase().catch(console.error);