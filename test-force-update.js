// Script para testar e forçar atualização do YouTube
// Cole este código no console do navegador em http://localhost:8080/mindset

async function testForceUpdate() {
  console.log('🚀 Testando forçar atualização do YouTube...');
  
  try {
    // Verificar se youtubeService e supabase estão disponíveis
    if (typeof window.youtubeService === 'undefined') {
      console.error('❌ youtubeService não encontrado. Recarregue a página.');
      return;
    }
    
    if (typeof window.supabase === 'undefined') {
      console.error('❌ supabase não encontrado. Recarregue a página.');
      return;
    }
    
    console.log('✅ youtubeService e supabase encontrados!');
    
    // Verificar vídeos atuais no banco
    console.log('🔍 Verificando vídeos atuais no banco...');
    const categories = ['audiobook', 'podcast', 'lecture'];
    
    for (const category of categories) {
      const { data, error } = await window.supabase
        .from('youtube_videos')
        .select('count')
        .eq('category', category);
      
      if (error) {
        console.error(`❌ Erro ao verificar ${category}:`, error);
      } else {
        console.log(`📊 ${category}: ${data?.length || 0} vídeos no banco`);
      }
    }
    
    // Perguntar se deseja forçar atualização
    const forceUpdate = confirm('Deseja forçar a atualização de todas as categorias? Isso pode levar alguns minutos e usar quota da API do YouTube.');
    
    if (!forceUpdate) {
      console.log('❌ Atualização cancelada pelo usuário.');
      return;
    }
    
    console.log('🔄 Iniciando atualização forçada...');
    
    // Forçar atualização de todas as categorias
    await window.youtubeService.forceUpdateAllCategories();
    
    console.log('✅ Atualização forçada concluída!');
    
    // Verificar novamente os vídeos no banco
    console.log('🔍 Verificando vídeos após atualização...');
    
    for (const category of categories) {
      const { data, error } = await window.supabase
        .from('youtube_videos')
        .select('count')
        .eq('category', category);
      
      if (error) {
        console.error(`❌ Erro ao verificar ${category}:`, error);
      } else {
        console.log(`📊 ${category}: ${data?.length || 0} vídeos no banco (após atualização)`);
      }
    }
    
    // Recarregar a página para ver os novos vídeos
    const reload = confirm('Atualização concluída! Deseja recarregar a página para ver os novos vídeos?');
    if (reload) {
      window.location.reload();
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar automaticamente
testForceUpdate();