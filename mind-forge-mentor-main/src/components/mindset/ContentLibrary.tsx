import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Play, Clock, BookOpen, Podcast } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ContentItem {
  id: string;
  title: string;
  type: "audiobook" | "podcast" | "lecture";
  duration: string;
  description: string;
  thumbnail: string;
  url: string;
}

const sampleContent: ContentItem[] = [
  {
    id: "1",
    title: "O Poder do Agora - Eckhart Tolle",
    type: "audiobook",
    duration: "7h 37m",
    description: "Um guia para a iluminação espiritual e consciência do momento presente",
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop",
    url: "#"
  },
  {
    id: "2",
    title: "Quebrando o Hábito de Ser Você Mesmo - Joe Dispenza",
    type: "audiobook",
    duration: "10h 49m",
    description: "Como perder sua mente e criar uma nova através da neurociência",
    thumbnail: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=200&fit=crop",
    url: "#"
  },
  {
    id: "3",
    title: "O Mestre da Mentalidade - Tim Ferriss",
    type: "podcast",
    duration: "1h 23m",
    description: "Desconstruindo performers de classe mundial e suas estruturas mentais",
    thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=200&fit=crop",
    url: "#"
  },
];

interface ContentLibraryProps {
  className?: string;
}

export default function ContentLibrary({ className }: ContentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredContent = sampleContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "audiobook":
        return <BookOpen className="w-4 h-4" />;
      case "podcast":
        return <Podcast className="w-4 h-4" />;
      case "lecture":
        return <Play className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="liberation-card">
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            Mindset: O Arsenal da Expansão
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A Matrix prospera na ignorância. Arme sua mente com o conhecimento que te liberta. 
            Cada insight é um tijolo a menos no muro da sua prisão mental.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="liberation-card">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Sabedoria..."
              className="pl-10 bg-transparent border-border/30 focus:border-primary/50"
            />
          </div>
          
          <div className="flex space-x-2">
            {["all", "audiobook", "podcast", "lecture"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  selectedType === type
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary/20 text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                )}
              >
                {type === "all" ? "Todo Conteúdo" : 
                 type === "audiobook" ? "Audiolivro" :
                 type === "podcast" ? "Podcast" :
                 type === "lecture" ? "Palestra" :
                 type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        <div className="liberation-card">
          <h3 className="font-serif text-xl font-semibold text-primary golden-wisdom mb-4">
            Audiolivros: A Sabedoria dos Gigantes
          </h3>
          <div className="grid gap-4">
            {filteredContent
              .filter(item => item.type === "audiobook")
              .map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
          </div>
        </div>

        <div className="liberation-card">
          <h3 className="font-serif text-xl font-semibold text-primary golden-wisdom mb-4">
            Palestras e Podcasts: Frequências dos Mestres
          </h3>
          <div className="grid gap-4">
            {filteredContent
              .filter(item => item.type === "podcast" || item.type === "lecture")
              .map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentCard({ item }: { item: ContentItem }) {
  return (
    <div className="group cursor-pointer border border-border/30 rounded-xl p-4 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      <div className="flex space-x-4">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-secondary/20 flex-shrink-0">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {item.title}
            </h4>
            <div className="flex items-center space-x-1 text-muted-foreground text-sm ml-2">
              {getTypeIcon(item.type)}
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
            {item.description}
          </p>
          
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1 text-muted-foreground text-sm">
              <Clock className="w-3 h-3" />
              <span>{item.duration}</span>
            </div>
            <span className="text-primary text-sm font-medium">
              {item.type === "audiobook" ? "Audiolivro" :
               item.type === "podcast" ? "Podcast" :
               item.type === "lecture" ? "Palestra" :
               item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTypeIcon(type: string) {
  switch (type) {
    case "audiobook":
      return <BookOpen className="w-4 h-4" />;
    case "podcast":
      return <Podcast className="w-4 h-4" />;
    case "lecture":
      return <Play className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
}