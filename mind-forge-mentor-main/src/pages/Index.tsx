import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import consciousnessHero from "@/assets/consciousness-hero.jpg";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirecionar usuário autenticado para o dashboard
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleStartJourney = () => {
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="sacred-thinking"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <div 
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(26, 58, 58, 0.7), rgba(26, 58, 58, 0.8)), url(${consciousnessHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Partículas flutuantes de sabedoria */}
        <div className="absolute top-20 left-16 wisdom-particle" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-32 right-20 wisdom-particle" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-24 left-24 wisdom-particle" style={{ animationDelay: '6s' }}></div>
        <div className="absolute bottom-40 right-16 wisdom-particle" style={{ animationDelay: '9s' }}></div>

        <div className="max-w-4xl mx-auto space-y-8 z-10">
          <div className="inline-flex items-center space-x-2 bg-primary/20 backdrop-blur-sm rounded-full px-6 py-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium golden-wisdom">Desperte Seu Potencial Interior</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Escape da Matrix <br />
            <span className="text-primary golden-wisdom">Mental</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary/90 max-w-3xl mx-auto leading-relaxed">
            Transforme ansiedade em clareza. Desbloqueie seu verdadeiro poder interior com 
            o método científico que reprograma sua mente para o sucesso absoluto.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="btn-consciousness text-lg px-8 py-6"
              onClick={handleStartJourney}
            >
              Iniciar Jornada de Transformação
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/30 text-primary hover:bg-primary/10">
              Descobrir o Método 5Ps
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              O Arsenal da <span className="text-primary golden-wisdom">Transformação</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ferramentas poderosas para reprogramar sua mente e manifestar seu potencial máximo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="liberation-card text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Centro de Comando
              </h3>
              <p className="text-muted-foreground text-sm">
                Seu ritual matinal de alinhamento para definir intenção e direção diária
              </p>
            </div>

            <div className="liberation-card text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                AI Mentor
              </h3>
              <p className="text-muted-foreground text-sm">
                Seu guia de sabedoria interior para conversas transformadoras
              </p>
            </div>

            <div className="liberation-card text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Diário da Alma
              </h3>
              <p className="text-muted-foreground text-sm">
                Forja de autoconhecimento com análise inteligente de padrões
              </p>
            </div>

            <div className="liberation-card text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Arsenal Mental
              </h3>
              <p className="text-muted-foreground text-sm">
                Biblioteca de conhecimento para expandir sua consciência
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}