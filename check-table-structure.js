// Script para verificar a estrutura da tabela
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://miwxirnutduprdyqngkh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd3hpcm51dGR1cHJkeXFuZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzQ5MTAsImV4cCI6MjA3NDI1MDkxMH0.sNX0dzpUuN2TVeay87nEs3aCYk74I_nHO_MSWBzw94o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Verificando estrutura da tabela youtube_videos...');
  
  try {
    // Tentar inserir um registro mínimo para ver quais campos são obrigatórios
    const testVideo = {
      video_id: 'test123',
      title: 'Teste',
      category: 'audiobook'
    };
    
    const { data, error } = await supabase
      .from('youtube_videos')
      .insert([testVideo])
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir teste:', error.message);
      console.log('💡 Detalhes do erro:', error);
    } else {
      console.log('✅ Teste inserido com sucesso:', data);
      
      // Remover o teste
      await supabase
        .from('youtube_videos')
        .delete()
        .eq('video_id', 'test123');
      
      console.log('🧹 Registro de teste removido');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkTableStructure().catch(console.error);