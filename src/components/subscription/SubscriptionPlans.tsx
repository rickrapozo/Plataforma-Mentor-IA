import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star } from 'lucide-react';
import { SUBSCRIPTION_PLANS, SubscriptionPlan, stripeService } from '@/services/stripeService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SubscriptionPlansProps {
  onSelectPlan?: (priceId: string) => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan }) => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleSelectPlan = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "destructive",
      });
      return;
    }

    if (onSelectPlan) {
      onSelectPlan(priceId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Escolha seu Plano</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Desbloqueie todo o potencial do Mind Forge Mentor com nossos planos de assinatura
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
          const planKey = key as SubscriptionPlan;
          const isPopular = planKey === 'PREMIUM';
          const isLoading = loading === planKey;

          return (
            <Card 
              key={key} 
              className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  <Crown className="w-4 h-4 mr-1" />
                  Mais Popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {planKey === 'BASIC' ? (
                    <Star className="w-12 h-12 text-blue-500" />
                  ) : (
                    <Crown className="w-12 h-12 text-yellow-500" />
                  )}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-muted-foreground">/{plan.interval === 'month' ? 'mês' : 'ano'}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  variant={isPopular ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleSelectPlan(planKey === 'BASIC' ? 'price_basic_monthly' : 'price_premium_monthly')}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Processando...
                    </>
                  ) : (
                    `Escolher Plano ${plan.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">
          Todos os planos incluem garantia de 7 dias. Cancele a qualquer momento.
        </p>
      </div>
    </div>
  );
};