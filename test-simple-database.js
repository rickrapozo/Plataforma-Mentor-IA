// Script simplificado para testar acesso ao banco de dados
// Cole este código no console do navegador em http://localhost:8080/mindset

async function testDatabase() {
  console.log('🔍 Testando acesso ao banco de dados...');
  
  try {
    // Verificar se supabase está disponível
    if (typeof window.supabase === 'undefined') {
      console.error('❌ supabase não encontrado. Recarregue a página.');
      return;
    }
    
    console.log('✅ supabase encontrado!');
    
    // Verificar vídeos por categoria
    const categories = ['audiobook', 'podcast', 'lecture'];
    let totalVideos = 0;
    
    for (const category of categories) {
      try {
        const { data, error, count } = await window.supabase
          .from('youtube_videos')
          .select('*', { count: 'exact' })
          .eq('category', category)
          .limit(3);
        
        if (error) {
          console.error(`❌ Erro ao buscar ${category}:`, error);
        } else {
          const videoCount = count || 0;
          totalVideos += videoCount;
          console.log(`📊 ${category}: ${videoCount} vídeos`);
          
          if (data && data.length > 0) {
            console.log(`   Exemplo: "${data[0].title}"`);
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao verificar categoria ${category}:`, error);
      }
    }
    
    console.log(`📈 Total de vídeos no banco: ${totalVideos}`);
    
    if (totalVideos === 0) {
      console.log('⚠️ Nenhum vídeo encontrado no banco de dados.');
      console.log('💡 Execute o script test-force-update.js para buscar vídeos da API do YouTube.');
    } else {
      console.log('✅ Banco de dados contém vídeos!');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar automaticamente
testDatabase();