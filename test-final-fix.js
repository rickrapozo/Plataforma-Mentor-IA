// Script de teste final para verificar as correções no salvamento de dados no Supabase
// Cole este código no console do navegador em http://localhost:8080/mindset

(async function testFinalFix() {
  console.log('🧪 Iniciando teste final das correções...');
  
  // Aguardar 2 segundos para garantir que tudo foi carregado
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Verificar se youtubeService e supabase estão disponíveis globalmente
  if (typeof youtubeService === 'undefined') {
    console.error('❌ youtubeService não está disponível globalmente');
    console.log('💡 Tentando importar youtubeService...');
    try {
      // Tentar acessar através do window
      if (window.youtubeService) {
        window.youtubeService = window.youtubeService;
        console.log('✅ youtubeService encontrado no window');
      } else {
        console.error('❌ youtubeService não encontrado');
        return;
      }
    } catch (error) {
      console.error('❌ Erro ao tentar acessar youtubeService:', error);
      return;
    }
  }
  
  if (typeof supabase === 'undefined') {
    console.error('❌ supabase não está disponível globalmente');
    console.log('💡 Tentando acessar supabase através do window...');
    try {
      if (window.supabase) {
        window.supabase = window.supabase;
        console.log('✅ supabase encontrado no window');
      } else {
        console.error('❌ supabase não encontrado');
        return;
      }
    } catch (error) {
      console.error('❌ Erro ao tentar acessar supabase:', error);
      return;
    }
  }
  
  console.log('✅ Dependências verificadas');
  
  // Verificar chave da API do YouTube
  console.log('🔑 Verificando configuração da chave da API do YouTube...');
  
  // Tentar diferentes formas de obter a chave
  const envKey = import.meta?.env?.VITE_YOUTUBE_API_KEY;
  const localStorageKey = localStorage.getItem('youtube_api_key');
  const sessionStorageKey = sessionStorage.getItem('youtube_api_key');
  
  console.log('🔍 Chave da variável de ambiente:', !!envKey ? '✅ Encontrada' : '❌ Não encontrada');
  console.log('🔍 Chave do localStorage:', !!localStorageKey ? '✅ Encontrada' : '❌ Não encontrada');
  console.log('🔍 Chave do sessionStorage:', !!sessionStorageKey ? '✅ Encontrada' : '❌ Não encontrada');
  
  // Se não houver chave configurada, sugerir configuração
  if (!envKey && !localStorageKey && !sessionStorageKey) {
    console.warn('⚠️ Nenhuma chave da API do YouTube encontrada!');
    console.log('💡 Para configurar uma chave temporária, execute:');
    console.log('localStorage.setItem("youtube_api_key", "SUA_CHAVE_AQUI")');
    console.log('💡 Ou configure a variável de ambiente VITE_YOUTUBE_API_KEY');
  }
  
  // Testar conexão com o banco de dados
  console.log('🔗 Testando conexão com o Supabase...');
  try {
    const { data, error } = await supabase.from('youtube_videos').select('count').limit(1);
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error);
      console.log('💡 Verifique as configurações do Supabase e as políticas RLS');
      return;
    }
    console.log('✅ Conexão com Supabase OK');
  } catch (error) {
    console.error('❌ Erro inesperado na conexão com Supabase:', error);
    return;
  }
  
  // Contar vídeos existentes por categoria
  console.log('📊 Verificando vídeos existentes por categoria...');
  const categories = ['audiobook', 'podcast', 'lecture'];
  const videoCounts = {};
  
  for (const category of categories) {
    try {
      const { count, error } = await supabase
        .from('youtube_videos')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);
      
      if (error) {
        console.error(`❌ Erro ao contar vídeos da categoria ${category}:`, error);
        videoCounts[category] = 'erro';
      } else {
        videoCounts[category] = count || 0;
        console.log(`📹 ${category}: ${count || 0} vídeos`);
      }
    } catch (error) {
      console.error(`❌ Erro inesperado ao contar vídeos da categoria ${category}:`, error);
      videoCounts[category] = 'erro';
    }
  }
  
  // Verificar status das últimas atualizações da API
  console.log('📋 Verificando status das últimas atualizações da API...');
  try {
    const { data: apiUpdates, error } = await supabase
      .from('youtube_api_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Erro ao buscar status das atualizações:', error);
    } else if (apiUpdates && apiUpdates.length > 0) {
      console.log('📊 Últimas atualizações da API:');
      apiUpdates.forEach(update => {
        const status = update.status === 'success' ? '✅' : 
                      update.status === 'quota_exceeded' ? '🚫' : 
                      update.status === 'invalid_key' ? '🔑' : '❌';
        console.log(`  ${status} ${update.category}: ${update.status} (${update.videos_fetched || 0} vídeos, quota: ${update.api_quota_used || 0})`);
        if (update.error_message) {
          console.log(`    Erro: ${update.error_message}`);
        }
      });
    } else {
      console.log('📝 Nenhuma atualização da API registrada ainda');
    }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar status das atualizações:', error);
  }
  
  // Se não houver vídeos, tentar forçar atualização
  const totalVideos = Object.values(videoCounts).reduce((sum, count) => 
    typeof count === 'number' ? sum + count : sum, 0);
  
  if (totalVideos === 0) {
    console.log('🔄 Nenhum vídeo encontrado. Tentando forçar atualização de todas as categorias...');
    
    try {
      // Verificar se o método existe
      if (typeof youtubeService.forceUpdateAllCategories !== 'function') {
        console.error('❌ Método forceUpdateAllCategories não encontrado no youtubeService');
        return;
      }
      
      console.log('🚀 Iniciando atualização forçada...');
      await youtubeService.forceUpdateAllCategories();
      
      // Aguardar um pouco e verificar novamente
      console.log('⏳ Aguardando 3 segundos antes de verificar os resultados...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar novamente os vídeos
      console.log('🔍 Verificando vídeos após a atualização...');
      let totalAfterUpdate = 0;
      
      for (const category of categories) {
        try {
          const { count, error } = await supabase
            .from('youtube_videos')
            .select('*', { count: 'exact', head: true })
            .eq('category', category);
          
          if (error) {
            console.error(`❌ Erro ao contar vídeos da categoria ${category} após atualização:`, error);
          } else {
            const newCount = count || 0;
            console.log(`📹 ${category}: ${newCount} vídeos (após atualização)`);
            totalAfterUpdate += newCount;
          }
        } catch (error) {
          console.error(`❌ Erro inesperado ao contar vídeos da categoria ${category} após atualização:`, error);
        }
      }
      
      if (totalAfterUpdate > 0) {
        console.log(`🎉 Sucesso! ${totalAfterUpdate} vídeos foram salvos no banco de dados.`);
      } else {
        console.warn('⚠️ Nenhum vídeo foi salvo após a atualização. Verifique os logs de erro.');
      }
      
    } catch (error) {
      console.error('❌ Erro durante a atualização forçada:', error);
      
      // Análise específica de erros
      if (error.message?.includes('QUOTA_EXCEEDED')) {
        console.log('🚫 Erro de quota da API do YouTube excedida');
        console.log('💡 Aguarde até amanhã ou configure uma nova chave de API');
      } else if (error.message?.includes('INVALID_API_KEY')) {
        console.log('🔑 Chave da API do YouTube inválida');
        console.log('💡 Verifique se a chave está correta e tem as permissões necessárias');
      } else if (error.message?.includes('Chave da API do YouTube não encontrada')) {
        console.log('🔑 Chave da API do YouTube não configurada');
        console.log('💡 Configure usando: localStorage.setItem("youtube_api_key", "SUA_CHAVE")');
      } else {
        console.log('❓ Erro desconhecido. Verifique os logs detalhados acima.');
      }
    }
  } else {
    console.log(`✅ Teste concluído! Total de ${totalVideos} vídeos encontrados no banco de dados.`);
  }
  
  console.log('🏁 Teste final das correções concluído!');
})();