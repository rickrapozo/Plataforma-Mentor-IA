import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoId,
  title,
  channelTitle,
  description
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAPIReady, setIsAPIReady] = useState(false);

  // Carrega a API do YouTube
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsAPIReady(true);
      };
    } else {
      setIsAPIReady(true);
    }
  }, []);

  // Cria o player quando o modal abre
  useEffect(() => {
    if (isOpen && isAPIReady && playerRef.current && !player) {
      const newPlayer = new window.YT.Player(playerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
          iv_load_policy: 3,
          fs: 1,
          cc_load_policy: 0,
          disablekb: 0,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            console.log('Player ready');
          },
          onStateChange: (event: any) => {
            console.log('Player state changed:', event.data);
          },
          onError: (event: any) => {
            console.error('Player error:', event.data);
          }
        }
      });
      setPlayer(newPlayer);
    }
  }, [isOpen, isAPIReady, videoId, player]);

  // Limpa o player quando o modal fecha
  useEffect(() => {
    if (!isOpen && player) {
      player.destroy();
      setPlayer(null);
    }
  }, [isOpen, player]);

  // Controles do player
  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const modalElement = document.getElementById('video-modal');
    if (!modalElement) return;

    if (!isFullscreen) {
      if (modalElement.requestFullscreen) {
        modalElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Fecha o modal com ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        id="video-modal"
        className={`relative w-full max-w-6xl bg-background rounded-2xl shadow-2xl overflow-hidden ${
          isFullscreen 
            ? 'h-screen max-w-none mx-0 rounded-none fixed inset-0' 
            : 'max-h-[calc(100vh-8rem)] my-auto'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-border/20 bg-background/95 backdrop-blur-sm">
          <div className="flex-1 min-w-0 text-center">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {channelTitle}
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              title={isMuted ? 'Ativar som' : 'Silenciar'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Maximize2 className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        
        {/* Video Player */}
        <div className={`relative bg-black flex items-center justify-center ${
          isFullscreen ? 'h-[calc(100vh-80px)]' : 'aspect-video max-h-[calc(100vh-16rem)]'
        }`}>
          <div 
            ref={playerRef}
            className="w-full h-full"
          />
          
          {/* Loading State */}
          {!isAPIReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Carregando player...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Description */}
        {!isFullscreen && description && (
          <div className="p-4 max-h-32 overflow-y-auto text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoModal;