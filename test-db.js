// Script para testar o banco de dados
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://miwxirnutduprdyqngkh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd3hpcm51dGR1cHJkeXFuZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzQ5MTAsImV4cCI6MjA3NDI1MDkxMH0.sNX0dzpUuN2TVeay87nEs3aCYk74I_nHO_MSWBzw94o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Verificando dados no banco...');
  
  const categories = ['audiobook', 'podcast', 'lecture'];
  
  for (const category of categories) {
    try {
      const { data, error, count } = await supabase
        .from('youtube_videos')
        .select('*', { count: 'exact' })
        .eq('category', category)
        .limit(3);
      
      if (error) {
        console.error(`❌ Erro ${category}:`, error.message);
      } else {
        console.log(`📊 ${category}: ${count || 0} vídeos`);
        if (data && data.length > 0) {
          console.log(`   Exemplo: ${data[0].title.substring(0, 50)}...`);
        }
      }
    } catch (err) {
      console.error(`❌ Erro categoria ${category}:`, err.message);
    }
  }
}

testDatabase().catch(console.error);