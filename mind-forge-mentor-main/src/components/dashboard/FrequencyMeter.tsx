import { cn } from "@/lib/utils";
import { TrendingUp, Zap, Target, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface FrequencyMeterProps {
  value: number; // 0-100
  days: number;
  className?: string;
  trend?: "up" | "down" | "stable";
  weeklyGoal?: number;
}

export default function FrequencyMeter({ 
  value, 
  days, 
  className,
  trend = "up",
  weeklyGoal = 80
}: FrequencyMeterProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const getFrequencyLevel = () => {
    if (value >= 90) return { label: "Transcendente", color: "text-purple-400", bgColor: "bg-purple-500/20" };
    if (value >= 75) return { label: "Elevado", color: "text-primary", bgColor: "bg-primary/20" };
    if (value >= 50) return { label: "Equilibrado", color: "text-blue-400", bgColor: "bg-blue-500/20" };
    if (value >= 25) return { label: "Crescendo", color: "text-orange-400", bgColor: "bg-orange-500/20" };
    return { label: "Iniciando", color: "text-red-400", bgColor: "bg-red-500/20" };
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default:
        return <Target className="w-4 h-4 text-primary" />;
    }
  };

  const frequencyLevel = getFrequencyLevel();
  const circumference = 2 * Math.PI * 50;
  const strokeDasharray = `${(animatedValue / 100) * circumference} ${circumference}`;

  return (
    <div className={cn("liberation-card", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-xl font-semibold text-foreground">
              Frequência Vibracional
            </h3>
          </div>
          <p className="text-muted-foreground text-sm">
            {days} Dias de Consistência na Jornada da Consciência
          </p>
        </div>
        
        {/* Main Meter */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg 
              className={cn(
                "w-40 h-40 transform -rotate-90 transition-all duration-1000",
                isVisible && "animate-spin-slow"
              )} 
              viewBox="0 0 120 120"
            >
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="hsl(180 15% 25%)"
                strokeWidth="6"
                fill="none"
                opacity="0.3"
              />
              
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="url(#frequencyGradient)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                className="transition-all duration-2000 ease-out"
                style={{
                  filter: "drop-shadow(0 0 12px hsl(51 100% 54% / 0.8))"
                }}
              />
              
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="frequencyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(51 100% 54%)" />
                  <stop offset="50%" stopColor="hsl(280 100% 70%)" />
                  <stop offset="100%" stopColor="hsl(51 80% 45%)" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-primary golden-wisdom">
                  {animatedValue}%
                </div>
                <div className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  frequencyLevel.bgColor,
                  frequencyLevel.color
                )}>
                  {frequencyLevel.label}
                </div>
              </div>
            </div>

            {/* Floating particles */}
            <div className="absolute top-2 right-4 w-2 h-2 bg-primary rounded-full animate-pulse opacity-60"></div>
            <div className="absolute bottom-4 left-2 w-1 h-1 bg-primary rounded-full animate-ping opacity-40"></div>
            <div className="absolute top-8 left-8 w-1.5 h-1.5 bg-primary rounded-full animate-bounce opacity-50"></div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-secondary/10 rounded-lg border border-secondary/20">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Calendar className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <div className="text-lg font-bold text-primary">{days}</div>
          </div>
          
          <div className="text-center p-3 bg-secondary/10 rounded-lg border border-secondary/20">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Target className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">Meta</span>
            </div>
            <div className="text-lg font-bold text-primary">{weeklyGoal}%</div>
          </div>
          
          <div className="text-center p-3 bg-secondary/10 rounded-lg border border-secondary/20">
            <div className="flex items-center justify-center space-x-1 mb-1">
              {getTrendIcon()}
              <span className="text-xs text-muted-foreground">Trend</span>
            </div>
            <div className={cn(
              "text-lg font-bold",
              trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-primary"
            )}>
              {trend === "up" ? "+5%" : trend === "down" ? "-2%" : "0%"}
            </div>
          </div>
        </div>
        
        {/* Progress towards goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso da Meta Semanal</span>
            <span className="text-primary font-medium">{Math.round((value / weeklyGoal) * 100)}%</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((value / weeklyGoal) * 100, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Inspirational message */}
        <div className="text-center p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {value >= 90 
              ? "Você transcendeu as limitações ordinárias. Sua consciência irradia transformação."
              : value >= 75 
              ? "Sua frequência está elevada. Continue expandindo sua consciência."
              : value >= 50
              ? "Você está no caminho certo. Cada escolha consciente eleva sua vibração."
              : "Toda jornada começa com um passo. Sua consciência está despertando."
            }
          </p>
        </div>
      </div>
    </div>
  );
}