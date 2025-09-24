import React, { useState, useEffect } from 'react';
import { TopNavigation } from '../components/ui/TopNavigation';
import { BottomNavigation } from '../components/ui/BottomNavigation';
import LogbookEntry from '../components/logbook/LogbookEntry';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../integrations/supabase/client';
import { Plus, BookOpen, Sparkles } from 'lucide-react';

interface Entry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

export default function Logbook() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('logbook_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar entradas:', error);
        return;
      }

      setEntries(data || []);
    } catch (error) {
      console.error('Erro ao buscar entradas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = () => {
    setIsCreating(true);
  };

  const handleSaveEntry = async (title: string, content: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('logbook_entries')
        .insert([
          {
            title,
            content,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar entrada:', error);
        return;
      }

      setEntries([data, ...entries]);
      setIsCreating(false);
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 px-4 pt-6">
        <TopNavigation />
        <div className="mt-20 flex items-center justify-center">
          <div className="sacred-thinking"></div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <TopNavigation />
      
      <div className="mt-20">
        {/* Hero Section */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary/20 backdrop-blur-sm rounded-full px-6 py-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">Registro Ativo</span>
          </div>
          
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Diário de Transformação
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Documente sua jornada de despertar. Cada reflexão é um passo em direção à sua verdade.
          </p>
        </div>

        {/* Create Entry Button */}
        <div className="mb-6">
          <button
            onClick={handleCreateEntry}
            className="w-full p-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">Nova Reflexão</span>
          </button>
        </div>

        {/* Create Entry Form */}
        {isCreating && (
          <div className="mb-6">
            <LogbookEntry
              isEditing={true}
              onSave={handleSaveEntry}
              onCancel={handleCancelCreate}
            />
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Seu diário está vazio
              </h3>
              <p className="text-muted-foreground">
                Comece documentando seus insights e reflexões
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <LogbookEntry
                key={entry.id}
                entry={entry}
                isEditing={false}
              />
            ))
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}