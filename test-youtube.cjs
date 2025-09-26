const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurações
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const YOUTUBE_API_KEY = process.env.VITE_YOUTUBE_API_KEY;

console.log('=== TESTE DA INTEGRAÇÃO YOUTUBE ===');
console.log('Supabase URL:', SUPABASE_URL);
console.log('YouTube API Key:', YOUTUBE_API_KEY ? 'Configurada' : 'NÃO CONFIGURADA');
console.log('Iniciando testes...\n');

async function testSupabase() {
  try {
    console.log('1. Testando conexão com Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Teste simples de conexão
    const { data, error } = await supabase.from('youtube_videos').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro no Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase OK');
    return true;
  } catch (error) {
    console.error('❌ Erro no Supabase:', error.message);
    return false;
  }
}

async function testYouTubeAPI() {
  try {
    console.log('\n2. Testando API do YouTube...');
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=desenvolvimento pessoal&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(url, {
      headers: {
        'Referer': 'http://localhost:8080'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro na API do YouTube:', response.status, errorData);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API do YouTube OK - Encontrados:', data.items?.length || 0, 'vídeos');
    
    if (data.items && data.items.length > 0) {
      console.log('📹 Exemplo:', data.items[0].snippet.title);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro na API do YouTube:', error.message);
    return false;
  }
}

async function checkDatabase() {
  try {
    console.log('\n3. Verificando vídeos no banco de dados...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const categories = ['audiobook', 'podcast', 'lecture'];
    
    for (const category of categories) {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('count')
        .eq('type', category);
      
      if (error) {
        console.error(`❌ Erro ao verificar ${category}:`, error.message);
        continue;
      }
      
      console.log(`📊 ${category}: ${data?.length || 0} vídeos`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error.message);
    return false;
  }
}

async function checkApiUpdates() {
  try {
    console.log('\n4. Verificando histórico de atualizações...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const { data, error } = await supabase
      .from('api_updates')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Erro ao verificar atualizações:', error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('📝 Nenhuma atualização registrada');
    } else {
      console.log('📝 Últimas atualizações:');
      data.forEach(update => {
        console.log(`   - ${update.category}: ${update.status} (${new Date(update.updated_at).toLocaleString()})`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar atualizações:', error.message);
    return false;
  }
}

async function runTests() {
  const results = {
    supabase: false,
    youtube: false,
    database: false,
    updates: false
  };
  
  results.supabase = await testSupabase();
  results.youtube = await testYouTubeAPI();
  results.database = await checkDatabase();
  results.updates = await checkApiUpdates();
  
  console.log('\n=== RESUMO ===');
  console.log('Supabase:', results.supabase ? '✅ OK' : '❌ ERRO');
  console.log('YouTube API:', results.youtube ? '✅ OK' : '❌ ERRO');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 Todos os testes passaram!');
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique a configuração.');
  }
}

runTests().catch(console.error);