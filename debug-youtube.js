// Script para debugar o youtubeService no console do navegador
// Execute este código no console das ferramentas de desenvolvedor

console.log('🔍 Iniciando debug do youtubeService...');

// 1. Verificar se o youtubeService está disponível
if (typeof window.youtubeService === 'undefined') {
  console.error('❌ youtubeService não está disponível globalmente');
  console.log('💡 Recarregue a página e tente novamente');
} else {
  console.log('✅ youtubeService encontrado');
  
  // 2. Verificar se a chave da API está configurada
  const hasApiKey = window.youtubeService.API_KEY && window.youtubeService.API_KEY.length > 0;
  console.log(`🔑 Chave da API configurada: ${hasApiKey ? '✅ Sim' : '❌ Não'}`);
  
  if (hasApiKey) {
    console.log(`🔑 Chave da API (primeiros 10 caracteres): ${window.youtubeService.API_KEY.substring(0, 10)}...`);
  }
  
  // 3. Testar requisição direta para a API do YouTube
  async function testYouTubeAPI() {
    try {
      console.log('🚀 Testando requisição direta para a API do YouTube...');
      
      const apiKey = window.youtubeService.API_KEY;
      const testQuery = 'desenvolvimento pessoal audiobook';
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(testQuery)}&type=video&maxResults=5&key=${apiKey}`;
      
      const response = await fetch(url, {
        headers: {
          'Referer': window.location.origin
        }
      });
      
      console.log(`📡 Status da resposta: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na requisição:', errorText);
        return false;
      }
      
      const data = await response.json();
      console.log('✅ Requisição bem-sucedida!');
      console.log(`📊 Vídeos encontrados: ${data.items ? data.items.length : 0}`);
      
      if (data.items && data.items.length > 0) {
        console.log('🎥 Primeiro vídeo:', data.items[0].snippet.title);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao testar API do YouTube:', error);
      return false;
    }
  }
  
  // 4. Verificar cache das categorias
  async function checkCacheStatus() {
    console.log('📋 Verificando status do cache...');
    
    const categories = ['audiobook', 'podcast', 'lecture'];
    
    for (const category of categories) {
      try {
        const shouldUpdate = await window.youtubeService.shouldUpdateCache(category);
        console.log(`📂 Categoria ${category}: ${shouldUpdate ? '🔄 Precisa atualizar' : '✅ Cache válido'}`);
      } catch (error) {
        console.error(`❌ Erro ao verificar cache da categoria ${category}:`, error);
      }
    }
  }
  
  // 5. Forçar inicialização das categorias
  async function forceInitialization() {
    console.log('🔄 Forçando inicialização das categorias...');
    
    try {
      await window.youtubeService.initializeAllCategories();
      console.log('✅ Inicialização concluída!');
      
      // Verificar quantos vídeos foram carregados
      const categories = ['audiobook', 'podcast', 'lecture'];
      let totalVideos = 0;
      
      for (const category of categories) {
        const videos = await window.youtubeService.getVideosByCategory(category);
        console.log(`📊 ${category}: ${videos.length} vídeos`);
        totalVideos += videos.length;
      }
      
      console.log(`📊 Total de vídeos carregados: ${totalVideos}`);
      
      if (totalVideos > 0) {
        console.log('🎉 Sucesso! Recarregando a página...');
        window.location.reload();
      } else {
        console.log('⚠️ Nenhum vídeo foi carregado. Verifique os logs acima.');
      }
      
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
    }
  }
  
  // Executar testes
  (async () => {
    await testYouTubeAPI();
    await checkCacheStatus();
    
    console.log('\n🎯 Para forçar a inicialização das categorias, execute:');
    console.log('forceInitialization()');
    
    // Disponibilizar função globalmente
    window.forceInitialization = forceInitialization;
  })();
}