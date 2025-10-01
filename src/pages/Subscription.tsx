import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { CheckoutForm } from '@/components/subscription/CheckoutForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPageProps {}

const Subscription: React.FC<SubscriptionPageProps> = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handlePlanSelect = (priceId: string) => {
    setSelectedPlan(priceId);
    setShowCheckout(true);
  };

  const handleBackToPlans = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa estar logado para acessar os planos de assinatura.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCheckout && selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              onClick={handleBackToPlans}
              variant="ghost" 
              className="text-white hover:text-purple-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Planos
            </Button>
          </div>
          
          <CheckoutForm 
            priceId={selectedPlan}
            planName={selectedPlan === 'price_basic' ? 'Plano Básico' : 'Plano Premium'}
            onBack={handleBackToPlans}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={handleGoBack}
            variant="ghost" 
            className="text-white hover:text-purple-300 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Escolha Seu Plano
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Desbloqueie todo o potencial do Mind Forge Mentor com nossos planos de assinatura
            </p>
          </div>
        </div>

        {/* Status da Assinatura Atual (se houver) */}
        <div className="mb-8">
          <SubscriptionStatus />
        </div>

        {/* Planos Disponíveis */}
        <div className="mb-8">
          <SubscriptionPlans onSelectPlan={handlePlanSelect} />
        </div>

        {/* Informações Adicionais */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Garantia de Satisfação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Oferecemos 30 dias de garantia. Se não ficar satisfeito, 
                reembolsamos 100% do valor pago.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Suporte Dedicado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Nossa equipe está sempre disponível para ajudar você a 
                aproveitar ao máximo sua experiência.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Rápido */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Posso cancelar a qualquer momento?</h4>
              <p className="text-slate-300 text-sm">
                Sim, você pode cancelar sua assinatura a qualquer momento através do portal de gerenciamento.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Como funciona o período de teste?</h4>
              <p className="text-slate-300 text-sm">
                Oferecemos 7 dias gratuitos para você experimentar todos os recursos premium.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Posso mudar de plano depois?</h4>
              <p className="text-slate-300 text-sm">
                Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Subscription;