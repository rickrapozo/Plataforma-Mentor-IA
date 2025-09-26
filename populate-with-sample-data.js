// Script para popular o banco de dados com dados de exemplo
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://miwxirnutduprdyqngkh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd3hpcm51dGR1cHJkeXFuZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzQ5MTAsImV4cCI6MjA3NDI1MDkxMH0.sNX0dzpUuN2TVeay87nEs3aCYk74I_nHO_MSWBzw94o';

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados de exemplo para cada categoria
const sampleVideos = {
  audiobook: [
    {
      video_id: 'dQw4w9WgXcQ',
      title: 'O Pequeno Príncipe - Audiobook Completo',
      description: 'Audiobook completo do clássico O Pequeno Príncipe de Antoine de Saint-Exupéry',
      thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channel_title: 'Audiobooks Brasil',
      channel_id: 'UC123456789',
      duration: 7200,
      view_count: 150000,
      like_count: 8500,
      comment_count: 450,
      published_at: '2023-01-15T10:00:00Z',
      tags: ['audiobook', 'literatura', 'clássico']
    },
    {
      video_id: 'abc123def456',
      title: 'Dom Casmurro - Machado de Assis - Audiobook',
      description: 'Narração completa do romance Dom Casmurro de Machado de Assis',
      thumbnail_url: 'https://i.ytimg.com/vi/abc123def456/mqdefault.jpg',
      channel_title: 'Literatura Brasileira',
      channel_id: 'UC987654321',
      duration: 9600,
      view_count: 89000,
      like_count: 4200,
      comment_count: 320,
      published_at: '2023-02-20T14:30:00Z',
      tags: ['audiobook', 'machado de assis', 'literatura brasileira']
    }
  ],
  podcast: [
    {
      video_id: 'xyz789uvw012',
      title: 'Podcast sobre Desenvolvimento Pessoal #45',
      description: 'Episódio sobre técnicas de produtividade e crescimento pessoal',
      thumbnail_url: 'https://i.ytimg.com/vi/xyz789uvw012/mqdefault.jpg',
      channel_title: 'Mente em Foco',
      channel_id: 'UC456789123',
      duration: 3600,
      view_count: 25000,
      like_count: 1800,
      comment_count: 150,
      published_at: '2023-03-10T09:00:00Z',
      tags: ['podcast', 'desenvolvimento pessoal', 'produtividade']
    },
    {
      video_id: 'mno345pqr678',
      title: 'Conversa sobre Empreendedorismo Digital',
      description: 'Bate-papo com especialistas sobre como começar um negócio online',
      thumbnail_url: 'https://i.ytimg.com/vi/mno345pqr678/mqdefault.jpg',
      channel_title: 'Empreende Aí',
      channel_id: 'UC789123456',
      duration: 4500,
      view_count: 42000,
      like_count: 3200,
      comment_count: 280,
      published_at: '2023-03-25T16:45:00Z',
      tags: ['podcast', 'empreendedorismo', 'negócios online']
    }
  ],
  lecture: [
    {
      video_id: 'stu901vwx234',
      title: 'Palestra: Como Desenvolver Inteligência Emocional',
      description: 'Conferência sobre o desenvolvimento da inteligência emocional no ambiente profissional',
      thumbnail_url: 'https://i.ytimg.com/vi/stu901vwx234/mqdefault.jpg',
      channel_title: 'Palestras Motivacionais',
      channel_id: 'UC234567890',
      duration: 5400,
      view_count: 78000,
      like_count: 5600,
      comment_count: 420,
      published_at: '2023-04-05T19:00:00Z',
      tags: ['palestra', 'inteligência emocional', 'desenvolvimento']
    },
    {
      video_id: 'ghi567jkl890',
      title: 'Aula Magna: Liderança e Gestão de Equipes',
      description: 'Aula sobre técnicas de liderança e como gerenciar equipes de alta performance',
      thumbnail_url: 'https://i.ytimg.com/vi/ghi567jkl890/mqdefault.jpg',
      channel_title: 'Universidade Corporativa',
      channel_id: 'UC567890123',
      duration: 6300,
      view_count: 95000,
      like_count: 7200,
      comment_count: 580,
      published_at: '2023-04-18T11:30:00Z',
      tags: ['aula', 'liderança', 'gestão', 'equipes']
    }
  ]
};

// Função para inserir vídeos no banco de dados
async function insertVideos() {
  console.log('🚀 Iniciando inserção de dados de exemplo...');
  
  let totalInserted = 0;
  let totalErrors = 0;
  
  for (const [category, videos] of Object.entries(sampleVideos)) {
    console.log(`\n📂 Inserindo vídeos da categoria: ${category}`);
    
    for (const video of videos) {
      try {
        const { data, error } = await supabase
          .from('youtube_videos')
          .insert([{
            ...video,
            category: category
          }]);

        if (error) {
          console.error(`❌ Erro ao inserir vídeo "${video.title}":`, error.message);
          totalErrors++;
        } else {
          console.log(`✅ Vídeo inserido: ${video.title}`);
          totalInserted++;
        }
      } catch (error) {
        console.error(`❌ Erro ao inserir vídeo "${video.title}":`, error.message);
        totalErrors++;
      }
    }
  }
  
  console.log(`\n📊 Resumo:`);
  console.log(`✅ Vídeos inseridos com sucesso: ${totalInserted}`);
  console.log(`❌ Erros encontrados: ${totalErrors}`);
  
  // Verificar contagem por categoria
  console.log(`\n📈 Contagem por categoria:`);
  for (const category of Object.keys(sampleVideos)) {
    try {
      const { count, error } = await supabase
        .from('youtube_videos')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);
      
      if (error) {
        console.log(`📊 ${category}: Erro ao contar - ${error.message}`);
      } else {
        console.log(`📊 ${category}: ${count} vídeos`);
      }
    } catch (error) {
      console.log(`📊 ${category}: Erro ao contar - ${error.message}`);
    }
  }
}

// Executar o script
insertVideos().catch(console.error);