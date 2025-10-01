import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react';

const CheckoutCancel: React.FC = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/subscription');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Pagamento Cancelado
          </CardTitle>
          <CardDescription className="text-base">
            Não se preocupe! Você pode tentar novamente a qualquer momento.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Por que isso aconteceu?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Você cancelou o processo de pagamento</li>
              <li>• Houve um problema com o método de pagamento</li>
              <li>• A sessão expirou</li>
              <li>• Erro temporário no sistema</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Seus dados não foram perdidos. Você pode continuar de onde parou.
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleTryAgain} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
            
            <Button 
              onClick={handleGoBack} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <Button 
              onClick={handleGoHome} 
              variant="ghost" 
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir para Início
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Precisa de ajuda? Entre em contato com nosso suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutCancel;