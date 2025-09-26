// Script simplificado para popular o banco de dados
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://miwxirnutduprdyqngkh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd3hpcm51dGR1cHJkeXFuZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzQ5MTAsImV4cCI6MjA3NDI1MDkxMH0.sNX0dzpUuN2TVeay87nEs3aCYk74I_nHO_MSWBzw94o';

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados simplificados para teste
const sampleVideos = [
  // Audiobooks
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'O Poder do Hábito - Audiobook Completo',
    description: 'Audiobook completo sobre como formar hábitos positivos.',
    thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channel_title: 'Audiobooks Brasil',
    channel_id: 'UC123456789',
    duration: 'PT2H30M15S',
    view_count: 150000,
    like_count: 8500,
    comment_count: 450,
    published_at: '2024-01-15T10:00:00+00:00',
    category: 'audiobook',
    tags: ['desenvolvimento pessoal', 'hábitos']
  },
  {
    video_id: 'abc123def456',
    title: 'Mindset - A Nova Psicologia do Sucesso',
    description: 'Audiobook sobre mentalidade de crescimento.',
    thumbnail_url: 'https://i.ytimg.com/vi/abc123def456/maxresdefault.jpg',
    channel_title: 'Livros em Áudio',
    channel_id: 'UC987654321',
    duration: 'PT3H15M22S',
    view_count: 89000,
    like_count: 5200,
    comment_count: 320,
    published_at: '2024-02-10T14:30:00+00:00',
    category: 'audiobook',
    tags: ['psicologia', 'sucesso']
  },
  {
    video_id: 'xyz789uvw012',
    title: 'Inteligência Emocional - Daniel Goleman',
    description: 'Audiobook sobre inteligência emocional.',
    thumbnail_url: 'https://i.ytimg.com/vi/xyz789uvw012/maxresdefault.jpg',
    channel_title: 'Psicologia em Áudio',
    channel_id: 'UC456789123',
    duration: 'PT4H05M18S',
    view_count: 125000,
    like_count: 7800,
    comment_count: 580,
    published_at: '2024-01-28T09:15:00+00:00',
    category: 'audiobook',
    tags: ['inteligência emocional', 'psicologia']
  },

  // Podcasts
  {
    video_id: 'pod123abc456',
    title: 'Como Desenvolver Disciplina Mental - Podcast',
    description: 'Episódio sobre técnicas para desenvolver disciplina.',
    thumbnail_url: 'https://i.ytimg.com/vi/pod123abc456/maxresdefault.jpg',
    channel_title: 'Mente Forte Podcast',
    channel_id: 'UC111222333',
    duration: 'PT45M30S',
    view_count: 45000,
    like_count: 2800,
    comment_count: 180,
    published_at: '2024-03-05T16:00:00+00:00',
    category: 'podcast',
    tags: ['disciplina', 'foco']
  },
  {
    video_id: 'pod789xyz123',
    title: 'Meditação e Mindfulness na Prática',
    description: 'Conversa sobre os benefícios da meditação.',
    thumbnail_url: 'https://i.ytimg.com/vi/pod789xyz123/maxresdefault.jpg',
    channel_title: 'Bem-Estar Mental',
    channel_id: 'UC444555666',
    duration: 'PT52M15S',
    view_count: 67000,
    like_count: 4100,
    comment_count: 250,
    published_at: '2024-02-20T11:30:00+00:00',
    category: 'podcast',
    tags: ['meditação', 'mindfulness']
  },
  {
    video_id: 'pod456def789',
    title: 'Gestão do Tempo e Prioridades',
    description: 'Estratégias para gerenciar tempo e prioridades.',
    thumbnail_url: 'https://i.ytimg.com/vi/pod456def789/maxresdefault.jpg',
    channel_title: 'Produtividade Total',
    channel_id: 'UC777888999',
    duration: 'PT38M42S',
    view_count: 32000,
    like_count: 1900,
    comment_count: 120,
    published_at: '2024-03-12T13:45:00+00:00',
    category: 'podcast',
    tags: ['gestão do tempo', 'organização']
  },

  // Lectures
  {
    video_id: 'lec123abc789',
    title: 'Neuroplasticidade: Como o Cérebro se Adapta',
    description: 'Palestra sobre neuroplasticidade.',
    thumbnail_url: 'https://i.ytimg.com/vi/lec123abc789/maxresdefault.jpg',
    channel_title: 'Ciência da Mente',
    channel_id: 'UC123789456',
    duration: 'PT1H25M33S',
    view_count: 98000,
    like_count: 6200,
    comment_count: 380,
    published_at: '2024-01-22T15:20:00+00:00',
    category: 'lecture',
    tags: ['neuroplasticidade', 'cérebro']
  },
  {
    video_id: 'lec456def012',
    title: 'Psicologia Positiva e Felicidade',
    description: 'Conferência sobre os fundamentos da felicidade.',
    thumbnail_url: 'https://i.ytimg.com/vi/lec456def012/maxresdefault.jpg',
    channel_title: 'Psicologia Aplicada',
    channel_id: 'UC654321987',
    duration: 'PT1H12M45S',
    view_count: 76000,
    like_count: 4800,
    comment_count: 290,
    published_at: '2024-02-08T10:00:00+00:00',
    category: 'lecture',
    tags: ['psicologia positiva', 'felicidade']
  },
  {
    video_id: 'lec789ghi345',
    title: 'Técnicas de Memorização e Aprendizado',
    description: 'Palestra sobre métodos para melhorar a memória.',
    thumbnail_url: 'https://i.ytimg.com/vi/lec789ghi345/maxresdefault.jpg',
    channel_title: 'Aprendizado Eficaz',
    channel_id: 'UC987123654',
    duration: 'PT1H38M20S',
    view_count: 112000,
    like_count: 7500,
    comment_count: 420,
    published_at: '2024-03-01T14:15:00+00:00',
    category: 'lecture',
    tags: ['memorização', 'aprendizado']
  }
];

async function populateDatabase() {
  console.log('🚀 Iniciando população do banco de dados...');
  
  try {
    // Inserir vídeos um por vez para identificar problemas
    let successCount = 0;
    
    for (const video of sampleVideos) {
      try {
        const { data, error } = await supabase
          .from('youtube_videos')
          .insert([video])
          .select();
        
        if (error) {
          console.error(`❌ Erro ao inserir "${video.title}":`, error.message);
        } else {
          console.log(`✅ Inserido: ${video.title}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Erro geral ao inserir "${video.title}":`, err.message);
      }
    }
    
    console.log(`🎉 ${successCount} de ${sampleVideos.length} vídeos inseridos!`);
    
    // Verificar inserção por categoria
    const categories = ['audiobook', 'podcast', 'lecture'];
    for (const category of categories) {
      const { count } = await supabase
        .from('youtube_videos')
        .select('*', { count: 'exact' })
        .eq('category', category);
      
      console.log(`📊 ${category}: ${count} vídeos`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

populateDatabase().catch(console.error);