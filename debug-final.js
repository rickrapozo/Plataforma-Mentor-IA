// SCRIPT FINAL DE DEBUG - Cole no console após recarregar a página

console.log('🚀 Iniciando debug final...');

// Aguardar um pouco para garantir que o componente carregou
setTimeout(() => {
  console.log('🔍 Verificando objetos globais...');
  
  // Verificar youtubeService
  if (typeof window.youtubeService !== 'undefined') {
    console.log('✅ youtubeService encontrado!');
    console.log('📋 Métodos disponíveis:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.youtubeService)));
  } else {
    console.error('❌ youtubeService não encontrado');
  }
  
  // Verificar supabase
  if (typeof window.supabase !== 'undefined') {
    console.log('✅ supabase encontrado!');
    console.log('📋 Objeto supabase:', window.supabase);
    
    // Testar conexão com banco
    testDatabase();
  } else {
    console.error('❌ supabase não encontrado');
    console.log('💡 Aguarde o carregamento do componente ou recarregue a página');
  }
}, 2000);

async function testDatabase() {
  console.log('🔍 Testando conexão com banco de dados...');
  
  try {
    const categories = ['audiobook', 'podcast', 'lecture'];
    let totalVideos = 0;
    
    for (const category of categories) {
      const { data, error, count } = await window.supabase
        .from('youtube_videos')
        .select('*', { count: 'exact' })
        .eq('category', category)
        .limit(1);
      
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
    }
    
    console.log(`📈 Total de vídeos: ${totalVideos}`);
    
    if (totalVideos === 0) {
      console.log('⚠️ Banco vazio! Executando busca automática...');
      
      // Forçar atualização automática
      if (window.youtubeService && window.youtubeService.forceUpdateAllCategories) {
        console.log('🔄 Iniciando busca de vídeos...');
        await window.youtubeService.forceUpdateAllCategories();
        console.log('✅ Busca concluída! Recarregue a página para ver os resultados.');
      }
    } else {
      console.log('✅ Banco de dados OK! A aplicação deve estar funcionando.');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}