// Script de teste simples para o navegador
// Cole este código no console do navegador em http://localhost:8080/mindset

console.log('=== TESTE DA API YOUTUBE NO NAVEGADOR ===');

const YOUTUBE_API_KEY = 'AIzaSyD5gygjyhPz2UrDbm8h9WS-r8yzpqag5r4';

async function testYouTubeAPI() {
  try {
    console.log('🔍 Testando busca na API do YouTube...');
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=desenvolvimento pessoal&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro na API:', response.status, errorData);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API funcionando! Encontrados:', data.items?.length || 0, 'vídeos');
    
    if (data.items && data.items.length > 0) {
      console.log('📹 Exemplos encontrados:');
      data.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.snippet.title}`);
        console.log(`   Canal: ${item.snippet.channelTitle}`);
        console.log(`   ID: ${item.id.videoId}`);
        console.log('');
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro:', error);
    return false;
  }
}

async function testSupabase() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Verificar se o Supabase está disponível globalmente
    if (typeof window.supabase === 'undefined') {
      console.log('⚠️ Supabase não encontrado globalmente, tentando importar...');
      
      // Tentar acessar através do módulo
      const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js');
      const supabaseUrl = 'https://miwxirnutduprdyqngkh.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd3hpcm51dGR1cHJkeXFuZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzQ5MTAsImV4cCI6MjA3NDI1MDkxMH0.sNX0dzpUuN2TVeay87nEs3aCYk74I_nHO_MSWBzw94o';
      
      window.testSupabase = createClient(supabaseUrl, supabaseKey);
    }
    
    const supabase = window.supabase || window.testSupabase;
    
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro no Supabase:', error);
      return false;
    }
    
    console.log('✅ Supabase conectado!');
    return true;
  } catch (error) {
    console.error('❌ Erro no Supabase:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('Iniciando testes...\n');
  
  const youtubeOk = await testYouTubeAPI();
  console.log('');
  const supabaseOk = await testSupabase();
  
  console.log('\n=== RESUMO ===');
  console.log('YouTube API:', youtubeOk ? '✅ OK' : '❌ ERRO');
  console.log('Supabase:', supabaseOk ? '✅ OK' : '❌ ERRO');
  
  if (youtubeOk && supabaseOk) {
    console.log('\n🎉 Todos os testes passaram!');
    console.log('A aplicação deve conseguir buscar vídeos agora.');
  } else {
    console.log('\n⚠️ Alguns testes falharam.');
  }
}

// Executar os testes
runAllTests();