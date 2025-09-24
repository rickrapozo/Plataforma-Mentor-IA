import React, { useState, useEffect } from 'react';
import { TopNavigation } from '../components/ui/TopNavigation';
import { BottomNavigation } from '../components/ui/BottomNavigation';
import ContentLibrary from '../components/mindset/ContentLibrary';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../integrations/supabase/client';
import { Zap, Target, Brain } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  consciousness_level: number;
  consistency_streak: number;
  created_at: string;
}

export default function Mindset() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      // Usar a tabela 'users' em vez de 'user_profiles'
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        // Se o usuário não existe na tabela users, criar um perfil básico
        if (error.code === 'PGRST116') {
          console.log('Perfil não encontrado, criando perfil básico...');
          const newProfile = {
            auth_user_id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
            email: user.email || '',
            consistency_streak: 0
          };
          
          const { data: newData, error: insertError } = await supabase
            .from('users')
            .insert(newProfile)
            .select()
            .single();
            
          if (insertError) {
            console.error('Erro ao criar perfil:', insertError);
            return;
          }
          
          // Mapear os dados para o formato esperado
          setUserProfile({
            id: newData.id,
            name: newData.full_name,
            email: newData.email,
            consciousness_level: 1,
            consistency_streak: newData.consistency_streak || 0,
            created_at: newData.created_at
          });
        }
        return;
      }

      // Mapear os dados da tabela 'users' para o formato esperado
      setUserProfile({
        id: data.id,
        name: data.full_name,
        email: data.email,
        consciousness_level: 1, // Valor padrão
        consistency_streak: data.consistency_streak || 0,
        created_at: data.created_at
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <TopNavigation />
      
      <div className="mt-20">
        {/* Hero Section */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary/20 backdrop-blur-sm rounded-full px-6 py-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">Arsenal Ativo</span>
          </div>
          
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Arsenal Mental
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas e conhecimentos para fortalecer sua mente e acelerar sua transformação.
          </p>
        </div>

        {/* Content Library */}
        <ContentLibrary />
      </div>
      
      <BottomNavigation />
    </div>
  );
}