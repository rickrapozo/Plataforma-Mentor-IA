import { useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Eye, Save, Calendar } from "lucide-react";

interface LogbookEntryProps {
  className?: string;
}

export default function LogbookEntry({ className }: LogbookEntryProps) {
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // Simulate save operation
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis (replace with actual API call)
    setTimeout(() => {
      setAnalysis("Your words reveal a pattern of seeking external validation while your inner wisdom calls for self-trust. Notice how you use phrases that diminish your power - 'I think maybe' instead of 'I know.' Your subconscious is ready to step into certainty. What would change if you trusted your first instinct completely?");
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="liberation-card">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            Diário: Decodificando a Realidade Interior
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
      </div>

      {/* Writing Area */}
      <div className="liberation-card">
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que sua mente revelou para você hoje?"
            className="min-h-[300px] bg-transparent border-none resize-none focus:ring-0 text-foreground placeholder:text-muted-foreground text-base leading-relaxed"
          />
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
            <Button
              onClick={handleAnalyze}
              disabled={!content.trim() || isAnalyzing}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isAnalyzing ? "Analisando Padrões..." : "Analisar com Mentor"}
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!content.trim()}
              className="btn-consciousness"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaved ? "Pensamento Registrado ✓" : "Salvar Entrada"}
            </Button>
          </div>
            
            <div className="text-sm text-muted-foreground">
              {content.length} caracteres
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {(analysis || isAnalyzing) && (
        <div className="liberation-card">
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-primary golden-wisdom">
              Padrões Revelados:
            </h3>
            
            {isAnalyzing ? (
              <div className="flex items-center space-x-3">
                <div className="sacred-thinking"></div>
                <span className="text-muted-foreground">
                  Decodificando padrões subconscientes...
                </span>
              </div>
            ) : (
              <div className="bg-secondary/20 rounded-lg p-4 border border-primary/20">
                <p className="text-foreground leading-relaxed italic">
                  "{analysis}"
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  — Sócrates: "A vida não examinada não vale a pena ser vivida"
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}