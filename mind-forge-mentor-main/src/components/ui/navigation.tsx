import { cn } from "@/lib/utils";
import { Home, MessageCircle, BookOpen, Brain } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Command Center", icon: Home },
  { id: "mentor", label: "AI Mentor", icon: MessageCircle },
  { id: "logbook", label: "Logbook", icon: BookOpen },
  { id: "mindset", label: "Mindset", icon: Brain },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="matrix-nav fixed bottom-0 left-0 right-0 z-50">
      <div className="flex justify-around items-center py-4 px-4">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center space-y-1 transition-all duration-300 group"
            >
              <div className={cn(
                "p-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary/20 backdrop-blur-sm" 
                  : "hover:bg-primary/10"
              )}>
                <IconComponent 
                  className={cn(
                    "nav-icon",
                    isActive ? "active text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}