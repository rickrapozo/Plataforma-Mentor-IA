import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, Play, Clock, BookOpen, Podcast, Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import youtubeService from "@/services/youtubeService";
import { supabase } from "@/integrations/supabase/client";
import MatrixBackground from "./MatrixBackground";
import VideoModal from "./VideoModal";

interface ContentItem {
  id: string;
  video_id: string;
  title: string;
  type: "audiobook" | "podcast" | "lecture";
  duration: string;
  description: string;
  thumbnail_url: string;
  channel_title: string;
  view_count: number;
  published_at: string;
}

interface ContentLibraryProps {
  className?: string;
}

export default function ContentLibrary({ className }: ContentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado do modal de vídeo
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ContentItem | null>(null);

  // Função para abrir o modal de vídeo
  const openVideoModal = (item: ContentItem) => {
    setSelectedVideo(item);
    setIsVideoModalOpen(true);
  };

  // Função para fechar o modal de vídeo
  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  // Expor globalmente após o componente montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).youtubeService = youtubeService;
      (window as any).supabase = supabase;
      console.log('🔧 youtubeService e supabase expostos globalmente após mount');
      console.log('🔍 Verificando supabase:', typeof supabase, supabase);
    }
  }, []);

  // Carrega conteúdo inicial
  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carrega vídeos de todas as categorias
      const [audiobooks, podcasts, lectures] = await Promise.all([
        youtubeService.getVideosByCategory('audiobook'),
        youtubeService.getVideosByCategory('podcast'),
        youtubeService.getVideosByCategory('lecture')
      ]);

      const allContent = [
        ...audiobooks.map(video => ({ ...video, id: video.video_id, type: video.category })),
        ...podcasts.map(video => ({ ...video, id: video.video_id, type: video.category })),
        ...lectures.map(video => ({ ...video, id: video.video_id, type: video.category }))
      ];

      setContent(allContent);
    } catch (err) {
      console.error('Erro ao carregar conteúdo:', err);
      setError('Erro ao carregar conteúdo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadAllContent();
    } catch (err) {
      console.error('Erro ao atualizar conteúdo:', err);
      setError('Erro ao atualizar conteúdo. Tente novamente.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredContent = content.filter(item => {
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
    <div className={cn("space-y-8 w-full max-w-6xl mx-auto", className)}>
      {/* Header - Centralized */}
      <div className="liberation-card max-w-4xl mx-auto relative overflow-hidden">
        <MatrixBackground />
        <div className="space-y-6 text-center relative z-10">
          <div className="flex items-center justify-center">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground golden-wisdom">
                Mentalidade: O Arsenal da Expansão
              </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-lg max-w-2xl mx-auto">
            A Matrix prospera na ignorância. Arme sua mente com o conhecimento que te liberta. 
            Cada insight é um tijolo a menos no muro da sua prisão mental.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="border-primary/30 hover:border-primary/50"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters - Centralized */}
      <div className="liberation-card max-w-3xl mx-auto">
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Sabedoria..."
              className="pl-10 bg-transparent border-border/30 focus:border-primary/50 text-center"
            />
          </div>
          
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-3 justify-center">
              {["all", "audiobook", "podcast", "lecture"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                    selectedType === type
                      ? "bg-primary/20 text-primary border border-primary/30 shadow-md"
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
      </div>

      {/* Loading State */}
      {loading && (
        <div className="liberation-card">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Carregando conteúdo...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="liberation-card">
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={loadAllContent} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </div>
      )}

      {/* Content Grid - Layout 4x1 Desktop / 2x1 Mobile - Centralized */}
      {!loading && !error && (
        <div className="space-y-10">
          {/* Audiolivros */}
          {(selectedType === "all" || selectedType === "audiobook") && (
            <div className="liberation-card">
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-primary golden-wisdom mb-8 text-center">
                Audiolivros: A Sabedoria dos Gigantes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 justify-items-center max-w-7xl mx-auto">
                {filteredContent
                  .filter(item => item.type === "audiobook")
                  .slice(0, 20)
                  .map((item) => (
                    <ContentCard key={item.id} item={item} onVideoClick={openVideoModal} />
                  ))}
              </div>
            </div>
          )}

          {/* Podcasts */}
          {(selectedType === "all" || selectedType === "podcast") && (
            <div className="liberation-card">
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-primary golden-wisdom mb-8 text-center">
                Podcasts: Frequências dos Mestres
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 justify-items-center max-w-7xl mx-auto">
                {filteredContent
                  .filter(item => item.type === "podcast")
                  .slice(0, 20)
                  .map((item) => (
                    <ContentCard key={item.id} item={item} onVideoClick={openVideoModal} />
                  ))}
              </div>
            </div>
          )}

          {/* Palestras */}
          {(selectedType === "all" || selectedType === "lecture") && (
            <div className="liberation-card">
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-primary golden-wisdom mb-8 text-center">
                Palestras: Vozes da Transformação
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 justify-items-center max-w-7xl mx-auto">
                {filteredContent
                  .filter(item => item.type === "lecture")
                  .slice(0, 20)
                  .map((item) => (
                    <ContentCard key={item.id} item={item} onVideoClick={openVideoModal} />
                  ))}
              </div>
            </div>
          )}

          {/* Empty State - Centralized */}
          {filteredContent.length === 0 && (
            <div className="liberation-card max-w-2xl mx-auto">
              <div className="text-center py-16">
                <BookOpen className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Nenhum conteúdo encontrado
                </h3>
                <p className="text-muted-foreground text-lg">
                  Tente ajustar os filtros ou termos de busca.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={closeVideoModal}
          videoId={selectedVideo.video_id}
          title={selectedVideo.title}
          channelTitle={selectedVideo.channel_title}
          description={selectedVideo.description}
        />
      )}
    </div>
  );
}

function ContentCard({ item, onVideoClick }: { item: ContentItem; onVideoClick: (item: ContentItem) => void }) {
  const handleClick = () => {
    // Abre o modal de vídeo interno
    onVideoClick(item);
  };

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M visualizações`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K visualizações`;
    }
    return `${count} visualizações`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer border border-border/30 rounded-xl p-4 hover:border-primary/30 transition-all duration-300 hover:shadow-lg w-full max-w-md"
    >
      <div className="space-y-4">
        {/* Thumbnail */}
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-secondary/20">
          <img
            src={item.thumbnail_url}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-background/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-12 h-12 text-primary drop-shadow-lg" />
          </div>
          
          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-background/90 text-foreground px-2 py-1 rounded text-xs font-medium">
            {item.duration}
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm leading-tight">
              {item.title}
            </h4>
            <div className="flex items-center space-x-1 text-muted-foreground text-sm ml-2 flex-shrink-0">
              {getTypeIcon(item.type)}
            </div>
          </div>
          
          <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
            {item.description}
          </p>
          
          {/* Channel and Stats */}
          <div className="space-y-1">
            <p className="text-primary text-xs font-medium">
              {item.channel_title}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatViewCount(item.view_count)}</span>
              <span>{formatDate(item.published_at)}</span>
            </div>
          </div>
          
          {/* Category Badge */}
          <div className="flex justify-center pt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
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