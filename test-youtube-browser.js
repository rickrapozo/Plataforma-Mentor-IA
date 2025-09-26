// Script para testar a integração do YouTube no console do navegador
// Cole este código no console do navegador (F12) na página http://localhost:5173/mindset

console.log('🔍 Testando integração do YouTube...');

// Função para testar a API do YouTube diretamente
async function testYouTubeAPI() {
  const API_KEY = 'AIzaSyD5gygjyhPz2UrDbm8h9WS-r8yzpqag5r4';
  const query = 'audiobook personal development';
  const maxResults = 5;
  
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${API_KEY}`;
  
  try {
    console.log('📡 Fazendo requisição para YouTube API...');
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API do YouTube funcionando!');
      console.log('📊 Dados recebidos:', data);
      return data;
    } else {
      console.error('❌ Erro na API do YouTube:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro de rede:', error);
    return null;
  }
}

// Função para testar o Supabase
async function testSupabase() {
  try {
    console.log('🗄️ Testando conexão com Supabase...');
    
    // Verificar se o Supabase está disponível globalmente
    if (typeof window.supabase === 'undefined') {
      console.log('⚠️ Supabase não encontrado globalmente, tentando importar...');
      
      // Tentar acessar através do módulo
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = 'https://miwxirnutduprdyqngkh.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd3hpcm51dGR1cHJkeXFuZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzQ5MTAsImV4cCI6MjA3NDI1MDkxMH0.sNX0dzpUuN2TVeay87nEs3aCYk74I_nHO_MSWBzw94o';
      
      window.supabase = createClient(supabaseUrl, supabaseKey);
    }
    
    // Testar conexão
    const { data, error, count } = await window.supabase
      .from('youtube_videos')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('❌ Erro no Supabase:', error);
      return false;
    }
    
    console.log('✅ Supabase conectado!');
    console.log(`📊 Total de vídeos no banco: ${count}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error);
    return false;
  }
}

// Função para testar o YouTubeService
async function testYouTubeService() {
  try {
    console.log('🔧 Testando YouTubeService...');
    
    // Verificar se o YouTubeService está disponível
    if (typeof window.YouTubeService === 'undefined') {
      console.log('⚠️ YouTubeService não encontrado globalmente');
      
      // Tentar importar dinamicamente
      try {
        const module = await import('/src/services/youtubeService.ts');
        window.YouTubeService = module.YouTubeService;
      } catch (importError) {
        console.error('❌ Erro ao importar YouTubeService:', importError);
        return false;
      }
    }
    
    const youtubeService = new window.YouTubeService();
    
    // Testar busca de vídeos
    console.log('🔍 Testando busca de vídeos...');
    const videos = await youtubeService.getVideosByCategory('audiobook');
    
    console.log('✅ YouTubeService funcionando!');
    console.log(`📊 Vídeos encontrados: ${videos.length}`);
    console.log('📹 Primeiros vídeos:', videos.slice(0, 3));
    
    return true;
  } catch (error) {
    console.error('❌ Erro no YouTubeService:', error);
    return false;
  }
}

// Função principal de teste
async function runAllTests() {
  console.log('🚀 Iniciando testes completos...\n');
  
  // Teste 1: API do YouTube
  console.log('=== TESTE 1: API do YouTube ===');
  const youtubeResult = await testYouTubeAPI();
  
  // Teste 2: Supabase
  console.log('\n=== TESTE 2: Supabase ===');
  const supabaseResult = await testSupabase();
  
  // Teste 3: YouTubeService
  console.log('\n=== TESTE 3: YouTubeService ===');
  const serviceResult = await testYouTubeService();
  
  // Resumo
  console.log('\n=== RESUMO DOS TESTES ===');
  console.log(`YouTube API: ${youtubeResult ? '✅' : '❌'}`);
  console.log(`Supabase: ${supabaseResult ? '✅' : '❌'}`);
  console.log(`YouTubeService: ${serviceResult ? '✅' : '❌'}`);
  
  if (youtubeResult && supabaseResult && serviceResult) {
    console.log('🎉 Todos os testes passaram!');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
}

// Executar testes automaticamente
runAllTests();

// Também disponibilizar as funções individualmente
window.testYouTube = {
  api: testYouTubeAPI,
  supabase: testSupabase,
  service: testYouTubeService,
  all: runAllTests
};

console.log('💡 Dica: Use window.testYouTube.all() para executar todos os testes novamente');