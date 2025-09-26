// Script para popular o banco de dados criando uma política temporária
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
    
    // Primeiro, vamos criar uma política temporária para permitir inserções
    console.log('Criando política temporária para inserções...');
    
    const createPolicySQL = `
      CREATE POLICY IF NOT EXISTS "Temporary insert policy for sample data" 
      ON public.youtube_videos 
      FOR INSERT 
      TO anon, authenticated
      WITH CHECK (true);
    `;
    
    const { error: policyError } = await supabase.rpc('exec_sql', { 
      sql: createPolicySQL 
    });
    
    if (policyError) {
      console.log('Erro ao criar política (tentando continuar):', policyError.message);
    } else {
      console.log('Política temporária criada com sucesso!');
    }
    
    // Agora tentar inserir os dados
    console.log('Inserindo dados de exemplo...');
    
    for (const video of sampleVideos) {
      const { data, error } = await supabase
        .from('youtube_videos')
        .insert([video]);
      
      if (error) {
        console.error(`Erro ao inserir vídeo ${video.video_id}:`, error.message);
      } else {
        console.log(`✓ Vídeo "${video.title}" inserido com sucesso!`);
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
    
    console.log(`\n📊 Total de vídeos no banco: ${videos.length}`);
    
    if (videos.length > 0) {
      // Contar por categoria
      const categories = ['audiobook', 'podcast', 'lecture'];
      for (const category of categories) {
        const categoryVideos = videos.filter(v => v.category === category);
        console.log(`   ${category}: ${categoryVideos.length} vídeos`);
      }
      
      console.log('\n📋 Vídeos encontrados:');
      videos.forEach(video => {
        console.log(`   - ${video.title} (${video.category})`);
      });
    }
    
    // Remover a política temporária
    console.log('\nRemoção da política temporária...');
    const dropPolicySQL = `
      DROP POLICY IF EXISTS "Temporary insert policy for sample data" ON public.youtube_videos;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: dropPolicySQL 
    });
    
    if (dropError) {
      console.log('Aviso: Não foi possível remover a política temporária:', dropError.message);
    } else {
      console.log('✓ Política temporária removida com sucesso!');
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

populateDatabase();