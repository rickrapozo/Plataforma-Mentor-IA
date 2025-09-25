import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Eye, Save, Calendar, Trash2, X } from "lucide-react";

interface Thought {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface LogbookEntryProps {
  className?: string;
  thought?: Thought;
  isEditing?: boolean;
  onSave?: (title: string, content: string) => void;
  onCancel?: () => void;
  onDelete?: (id: string) => void;
}

export default function LogbookEntry({ 
  className, 
  thought, 
  isEditing = false, 
  onSave, 
  onCancel,
  onDelete 
}: LogbookEntryProps) {
  const [title, setTitle] = useState(thought?.title || "");
  const [content, setContent] = useState(thought?.content || "");
  const [isViewExpanded, setIsViewExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave?.(title, content);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (thought?.id && onDelete) {
      onDelete(thought.id);
    }
  };

  const toggleView = () => {
    setIsViewExpanded(!isViewExpanded);
  };

  // Se está editando (criando novo pensamento)
  if (isEditing) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="liberation-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              📝 Novo Pensamento
            </h2>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date().toLocaleDateString('pt-BR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {/* Título do Pensamento */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Título do Pensamento
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Como me sinto hoje..."
              className="bg-transparent border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Conteúdo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Conteúdo
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva seus pensamentos, reflexões, objetivos alcançados, desafios enfrentados..."
              className="min-h-[200px] bg-transparent border-primary/30 focus:border-primary resize-none text-foreground placeholder:text-muted-foreground text-base leading-relaxed"
            />
          </div>
          
          {/* Botões de Ação */}
          <div className="flex justify-between items-center">
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-muted-foreground/30 text-muted-foreground hover:bg-muted-foreground/10"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!title.trim() || !content.trim() || isSaving}
              className="btn-consciousness bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Pensamento"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Se está visualizando um pensamento existente
  return (
    <div className={cn("liberation-card relative", className)}>
      {/* Card do Pensamento */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1">
            {thought?.title}
          </h3>
          <div className="flex items-center space-x-2">
            {/* Ícone de Olho */}
            <Button
              onClick={toggleView}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-2"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {thought?.content}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {thought?.created_at && new Date(thought.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </span>
          
          {/* Ícone de Lixeira no canto inferior direito */}
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 p-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modal de Visualização Expandida */}
      {isViewExpanded && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  {thought?.title}
                </h2>
                <Button
                  onClick={toggleView}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">
                  {thought?.created_at && new Date(thought.created_at).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {thought?.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}