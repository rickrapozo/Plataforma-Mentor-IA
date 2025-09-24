import { Button } from "@/components/ui/button";
import { Home, MessageCircle, Book, Brain } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determinar página atual baseada na rota
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path === "/mentor") return "mentor";
    if (path === "/logbook") return "logbook";
    if (path === "/mindset") return "mindset";
    return "dashboard";
  };

  const current = getCurrentPage();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "mentor", label: "AI Mentor", icon: MessageCircle, path: "/mentor" },
    { id: "logbook", label: "Diário", icon: Book, path: "/logbook" },
    { id: "mindset", label: "Arsenal", icon: Brain, path: "/mindset" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/30">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex flex-col items-center space-y-1 h-auto py-2 px-3 text-xs font-medium transition-all duration-200",
                  current === item.id 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  current === item.id ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="block">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}