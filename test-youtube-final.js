// Script final para testar o YouTube Service
// Cole este código no console do navegador em http://localhost:8080/mindset

async function testYouTubeIntegration() {
  console.log('🚀 Testando integração completa do YouTube...');
  
  // Verificar se o youtubeService está disponível
  if (!window.youtubeService) {
    console.error('❌ youtubeService não encontrado. Aguarde o carregamento da página.');
    return;
  }
  
  const service = window.youtubeService;
  
  try {
    // 1. Verificar vídeos existentes por categoria
    console.log('\n📊 Verificando vídeos existentes...');
    const categories = ['audiobook', 'podcast', 'lecture'];
    let totalVideos = 0;
    
    for (const category of categories) {
      const videos = await service.getVideosByCategory(category);
      console.log(`📹 ${category}: ${videos?.length || 0} vídeos`);
      totalVideos += videos?.length || 0;
      
      if (videos && videos.length > 0) {
        console.log(`   Exemplo: "${videos[0].title}"`);
      }
    }
    
    // 2. Se não há vídeos, inicializar
    if (totalVideos === 0) {
      console.log('\n🔄 Nenhum vídeo encontrado. Inicializando categorias...');
      
      for (const category of categories) {
        console.log(`   Inicializando ${category}...`);
        try {
          await service.initializeCategory(category);
          console.log(`   ✅ ${category} inicializado`);
          
          // Verificar se funcionou
          const newVideos = await service.getVideosByCategory(category);
          console.log(`   📹 ${category}: ${newVideos?.length || 0} vídeos adicionados`);
          
        } catch (error) {
          console.error(`   ❌ Erro ao inicializar ${category}:`, error);
        }
      }
    }
    
    // 3. Verificar status final
    console.log('\n📈 Status final:');
    for (const category of categories) {
      const videos = await service.getVideosByCategory(category);
      console.log(`📹 ${category}: ${videos?.length || 0} vídeos`);
    }
    
    console.log('\n✅ Teste concluído! Recarregue a página para ver os resultados.');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
testYouTubeIntegration();