// Script para testar o conteúdo do banco de dados
// Cole este código no console do navegador em http://localhost:8080/mindset

async function testDatabaseContent() {
  console.log('🔍 Verificando conteúdo do banco de dados...');
  
  try {
    // Importar o cliente Supabase
    const { createClient } = window.supabase || {};
    
    if (!createClient) {
      console.error('❌ Supabase não está disponível');
      return;
    }
    
    const supabase = createClient(
      'https://yvqjqfqjqjqjqjqjqjqj.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2cWpxZnFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5OTc4NzEsImV4cCI6MjA1MzU3Mzg3MX0.example'
    );
    
    // Verificar vídeos por categoria
    const categories = ['audiobook', 'podcast', 'lecture'];
    
    for (const category of categories) {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('category', category)
        .limit(5);
      
      if (error) {
        console.error(`❌ Erro ao buscar ${category}:`, error);
      } else {
        console.log(`📹 ${category}: ${data?.length || 0} vídeos encontrados`);
        if (data && data.length > 0) {
          console.log(`   Exemplo: ${data[0].title}`);
        }
      }
    }
    
    // Verificar histórico de atualizações
    const { data: updates, error: updateError } = await supabase
      .from('youtube_cache_updates')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (updateError) {
      console.error('❌ Erro ao buscar atualizações:', updateError);
    } else {
      console.log(`📊 Histórico de atualizações: ${updates?.length || 0} registros`);
      if (updates && updates.length > 0) {
        console.log(`   Última atualização: ${updates[0].updated_at}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o teste
testDatabaseContent();