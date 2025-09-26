// Script simples para testar conexão com banco de dados
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yvqjqfqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2cWpxZnFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5OTc4NzEsImV4cCI6MjA1MzU3Mzg3MX0.example';

async function testDatabase() {
  console.log('🔍 Testando conexão com banco de dados...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verificar se a tabela existe
    const { data: tables, error: tablesError } = await supabase
      .from('youtube_videos')
      .select('count', { count: 'exact', head: true });
    
    if (tablesError) {
      console.error('❌ Erro ao acessar tabela youtube_videos:', tablesError.message);
      return;
    }
    
    console.log('✅ Tabela youtube_videos encontrada');
    
    // Verificar vídeos por categoria
    const categories = ['audiobook', 'podcast', 'lecture'];
    
    for (const category of categories) {
      const { data, error, count } = await supabase
        .from('youtube_videos')
        .select('id, title, category', { count: 'exact' })
        .eq('category', category)
        .limit(3);
      
      if (error) {
        console.error(`❌ Erro ao buscar ${category}:`, error.message);
        continue;
      }
      
      console.log(`\n📚 Categoria: ${category.toUpperCase()}`);
      console.log(`   Total: ${count || 0} vídeos`);
      
      if (data && data.length > 0) {
        data.forEach((video, index) => {
          console.log(`   ${index + 1}. ${video.title}`);
        });
      } else {
        console.log('   Nenhum vídeo encontrado');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testDatabase();