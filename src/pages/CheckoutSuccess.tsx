import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Aqui você pode fazer uma verificação adicional do status da sessão
      // Por enquanto, apenas mostramos a mensagem de sucesso
      setIsLoading(false);
      
      toast({
        title: "Pagamento realizado com sucesso!",
        description: "Sua assinatura foi ativada. Bem-vindo ao Mind Forge Mentor!",
        duration: 5000,
      });
    } else {
      // Se não há session_id, redireciona para home
      navigate('/');
    }
  }, [sessionId, navigate, toast]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-sm text-muted-foreground">Processando pagamento...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Pagamento Confirmado!
          </CardTitle>
          <CardDescription className="text-base">
            Sua assinatura foi ativada com sucesso. Agora você tem acesso completo ao Mind Forge Mentor.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">O que acontece agora?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Acesso completo a todos os recursos</li>
              <li>• Mentoria personalizada com IA</li>
              <li>• Biblioteca de conteúdo exclusivo</li>
              <li>• Acompanhamento de progresso</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleContinue} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Começar Jornada
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              onClick={handleGoHome} 
              variant="outline" 
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Você receberá um email de confirmação em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutSuccess;