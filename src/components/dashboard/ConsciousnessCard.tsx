import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Sparkles, Zap, Star } from "lucide-react";
import { useState } from "react";

interface ConsciousnessCardProps {
  title: string;
  description: string;
  completed?: boolean;
  onToggle?: () => void;
  className?: string;
  priority?: "low" | "medium" | "high";
  category?: "mindset" | "action" | "reflection";
}

export default function ConsciousnessCard({ 
  title, 
  description, 
  completed = false, 
  onToggle,
  className,
  priority = "medium",
  category = "mindset"
}: ConsciousnessCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryIcon = () => {
    switch (category) {
      case "action":
        return <Zap className="w-4 h-4" />;
      case "reflection":
        return <Star className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case "high":
        return "border-red-500/30 bg-red-500/5";
      case "low":
        return "border-blue-500/30 bg-blue-500/5";
      default:
        return "border-primary/30 bg-primary/5";
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case "action":
        return "Ação";
      case "reflection":
        return "Reflexão";
      default:
        return "Mindset";
    }
  };

  return (
    <div 
      className={cn(
        "liberation-card group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
        completed && "ring-2 ring-primary/30 bg-primary/5",
        className
      )} 
      onClick={onToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-4">
        <div className="mt-1 relative">
          {completed ? (
            <div className="relative">
              <CheckCircle className="w-6 h-6 text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping opacity-75"></div>
            </div>
          ) : (
            <Circle className={cn(
              "w-6 h-6 transition-all duration-300",
              isHovered ? "text-primary scale-110" : "text-muted-foreground"
            )} />
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          {/* Header with category badge */}
          <div className="flex items-center justify-between">
            <div className={cn(
              "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300",
              getPriorityColor()
            )}>
              {getCategoryIcon()}
              <span>{getCategoryLabel()}</span>
            </div>
            {priority === "high" && (
              <div className="flex items-center space-x-1 text-red-500">
                <Zap className="w-3 h-3" />
                <span className="text-xs font-medium">Urgente</span>
              </div>
            )}
          </div>

          <h3 className={cn(
            "font-serif text-lg font-semibold transition-all duration-300",
            completed ? "text-primary golden-wisdom" : "text-foreground group-hover:text-primary"
          )}>
            {title}
          </h3>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
          
          {completed && (
            <div className="flex items-center space-x-2 mt-3 p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-primary text-sm font-medium">
                Missão Cumprida • Frequência Elevada
              </span>
            </div>
          )}

          {!completed && isHovered && (
            <div className="flex items-center space-x-2 text-primary text-sm font-medium animate-fade-in">
              <Circle className="w-3 h-3" />
              <span>Clique para marcar como concluída</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 w-full bg-muted/30 rounded-full h-1 overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-1000 ease-out",
            completed ? "w-full bg-primary" : "w-0 bg-primary/50"
          )}
        />
      </div>
    </div>
  );
}