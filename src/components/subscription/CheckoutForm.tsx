import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { stripeService } from '@/services/stripeService';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  clientSecret: string;
  onBack?: () => void;
  planName?: string;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  clientSecret, 
  onBack, 
  planName 
}) => {
  const [loading, setLoading] = React.useState(true);

  const options = {
    clientSecret,
    onComplete: () => {
      // Redirecionar para página de sucesso ou atualizar estado
      console.log('Checkout completed successfully');
      // Aqui você pode implementar a lógica de redirecionamento
      // ou atualização do estado da aplicação
    }
  };

  React.useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Finalizar Assinatura</CardTitle>
              <CardDescription>
                {planName && `Plano: ${planName}`}
              </CardDescription>
            </div>
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              <span>Carregando checkout...</span>
            </div>
          ) : (
            <div id="checkout">
              <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Componente wrapper para gerenciar o estado do checkout
interface CheckoutWrapperProps {
  priceId: string;
  onBack?: () => void;
  planName?: string;
}

export const CheckoutWrapper: React.FC<CheckoutWrapperProps> = ({ 
  priceId, 
  onBack, 
  planName 
}) => {
  const [clientSecret, setClientSecret] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        setLoading(true);
        setError('');

        // Aqui você fará a chamada para seu backend para criar a sessão de checkout
        const clientSecret = await stripeService.createCheckoutSession(priceId);
        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Erro ao criar checkout session:', err);
        setError('Erro ao carregar o checkout. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    if (priceId) {
      createCheckoutSession();
    }
  }, [priceId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Preparando checkout...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Erro no Checkout</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>
                Tentar Novamente
              </Button>
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <span>Erro ao carregar checkout</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CheckoutForm 
      clientSecret={clientSecret} 
      onBack={onBack} 
      planName={planName} 
    />
  );
};