import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, Settings, AlertCircle } from 'lucide-react';
import { StripeSubscription, stripeService } from '@/services/stripeService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SubscriptionStatusProps {
  subscription?: StripeSubscription;
  onManageSubscription?: () => void;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ 
  subscription, 
  onManageSubscription 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const getStatusColor = (status: StripeSubscription['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'canceled':
      case 'incomplete':
      case 'incomplete_expired':
      case 'unpaid':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: StripeSubscription['status']) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'trialing':
        return 'Período de Teste';
      case 'past_due':
        return 'Pagamento Pendente';
      case 'canceled':
        return 'Cancelada';
      case 'incomplete':
        return 'Incompleta';
      case 'incomplete_expired':
        return 'Expirada';
      case 'unpaid':
        return 'Não Paga';
      default:
        return 'Desconhecido';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const handleManageSubscription = async () => {
    if (!subscription?.stripe_customer_id) return;
    
    setIsLoading(true);
    try {
      const portalUrl = await stripeService.createCustomerPortalSession(subscription.stripe_customer_id);
      window.open(portalUrl, '_blank');
    } catch (error) {
      console.error('Erro ao abrir portal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de gerenciamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
            Nenhuma Assinatura Ativa
          </CardTitle>
          <CardDescription>
            Você não possui uma assinatura ativa no momento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/subscription'}>
            Ver Planos Disponíveis
          </Button>
        </CardContent>
      </Card>
    );
  }

  const subscriptionItem = subscription.items.data[0];
  const price = subscriptionItem.price;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Sua Assinatura
          </CardTitle>
          <Badge className={getStatusColor(subscription.status)}>
            {getStatusText(subscription.status)}
          </Badge>
        </div>
        <CardDescription>
          Gerencie sua assinatura e informações de pagamento
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              Próximo Pagamento
            </div>
            <p className="font-medium">
              {formatDate(subscription.current_period_end)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <CreditCard className="w-4 h-4 mr-2" />
              Valor
            </div>
            <p className="font-medium">
              {formatPrice(price.unit_amount, price.currency)} / {price.recurring.interval === 'month' ? 'mês' : 'ano'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Período Atual</div>
          <p className="text-sm">
            {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
          </p>
        </div>

        {subscription.status === 'past_due' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <h4 className="font-medium text-yellow-800">Pagamento Pendente</h4>
                <p className="text-sm text-yellow-700">
                  Seu pagamento está pendente. Atualize suas informações de pagamento para continuar usando o serviço.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button 
            onClick={handleManageSubscription}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Carregando...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Assinatura
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};