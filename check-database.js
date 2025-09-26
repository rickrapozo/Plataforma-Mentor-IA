// Script para verificar vídeos no banco de dados e forçar atualização
// Execute no console do navegador

console.log('🔍 Verificando vídeos no banco de dados...');

async function checkDatabaseContent() {
  try {
    // Verificar se há vídeos por categoria
    const categories = ['audiobook', 'podcast', 'lecture'];
    let totalVideos = 0;
    
    for (const category of categories) {
      const videos = await window.youtubeService.getVideosByCategory(category);
      console.log(`📊 ${category}: ${videos.length} vídeos`);
      totalVideos += videos.length;
      
      // Mostrar alguns títulos se houver vídeos
      if (videos.length > 0) {
        console.log(`   📝 Exemplos: ${videos.slice(0, 3).map(v => v.title).join(', ')}`);
      }
    }
    
    console.log(`📊 Total de vídeos no banco: ${totalVideos}`);
    
    if (totalVideos === 0) {
      console.log('⚠️ Nenhum vídeo encontrado no banco de dados!');
      console.log('🔄 Vamos forçar a atualização...');
      await forceUpdateAllCategories();
    } else {
      console.log('✅ Vídeos encontrados no banco de dados!');
      console.log('💡 Se quiser forçar uma nova atualização, execute: forceUpdateAllCategories()');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco de dados:', error);
  }
}

async function forceUpdateAllCategories() {
  console.log('🚀 Forçando atualização de todas as categorias...');
  
  try {
    // Limpar cache forçando atualização
    const categories = ['audiobook', 'podcast', 'lecture'];
    
    for (const category of categories) {
      console.log(`🔄 Forçando atualização da categoria: ${category}`);
      
      // Deletar registros de cache para forçar atualização
      const { error } = await window.supabase
        .from('youtube_api_updates')
        .delete()
        .eq('category', category);
        
      if (error) {
        console.error(`❌ Erro ao limpar cache da categoria ${category}:`, error);
      } else {
        console.log(`✅ Cache limpo para categoria: ${category}`);
      }
      
      // Aguardar um pouco entre operações
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('🔄 Iniciando nova busca de vídeos...');
    
    // Agora forçar a inicialização
    await window.youtubeService.initializeAllCategories();
    
    console.log('✅ Atualização concluída! Verificando resultados...');
    
    // Verificar quantos vídeos foram carregados
    let totalVideos = 0;
    for (const category of categories) {
      const videos = await window.youtubeService.getVideosByCategory(category);
      console.log(`📊 ${category}: ${videos.length} vídeos`);
      totalVideos += videos.length;
    }
    
    console.log(`🎉 Total de vídeos carregados: ${totalVideos}`);
    
    if (totalVideos > 0) {
      console.log('🎉 Sucesso! Recarregando a página...');
      setTimeout(() => window.location.reload(), 2000);
    } else {
      console.log('⚠️ Ainda não há vídeos. Verifique se a API do YouTube está funcionando.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao forçar atualização:', error);
  }
}

// Verificar se as dependências estão disponíveis
if (typeof window.youtubeService === 'undefined') {
  console.error('❌ youtubeService não encontrado. Recarregue a página.');
} else if (typeof window.supabase === 'undefined') {
  console.error('❌ supabase não encontrado. Recarregue a página.');
} else {
  console.log('✅ Dependências encontradas. Iniciando verificação...');
  
  // Disponibilizar funções globalmente
  window.checkDatabaseContent = checkDatabaseContent;
  window.forceUpdateAllCategories = forceUpdateAllCategories;
  
  // Executar verificação automaticamente
  checkDatabaseContent();
}