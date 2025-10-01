import { loadStripe, Stripe } from '@stripe/stripe-js';

// Inicializar Stripe com a chave publicável
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export const getStripe = () => {
  return stripePromise;
};

// Tipos para o Stripe
export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: number;
  current_period_end: number;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        unit_amount: number;
        currency: string;
        recurring: {
          interval: 'month' | 'year';
        };
      };
    }>;
  };
}

export interface CreateCheckoutSessionParams {
  priceId: string;
  customerId?: string;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}

// Serviço para gerenciar operações do Stripe
export class StripeService {
  private static instance: StripeService;
  private stripe: Promise<Stripe | null>;

  private constructor() {
    this.stripe = getStripe();
  }

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  // Criar sessão de checkout
  async createCheckoutSession(priceId: string, mode: 'subscription' | 'payment' = 'subscription'): Promise<string> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          priceId,
          mode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar sessão de checkout');
      }

      const { clientSecret } = await response.json();
      return clientSecret;
    } catch (error) {
      console.error('Erro ao criar checkout session:', error);
      throw error;
    }
  }

  // Criar customer
  async createCustomer(email: string, name?: string): Promise<StripeCustomer> {
    try {
      const response = await fetch('/api/stripe/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar customer');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar customer:', error);
      throw error;
    }
  }

  // Obter assinaturas do customer
  async getCustomerSubscriptions(customerId: string): Promise<StripeSubscription[]> {
    try {
      const response = await fetch(`/api/stripe/customer/${customerId}/subscriptions`);

      if (!response.ok) {
        throw new Error('Erro ao buscar assinaturas');
      }

      const { subscriptions } = await response.json();
      return subscriptions;
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      throw error;
    }
  }

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/stripe/subscription/${subscriptionId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erro ao cancelar assinatura');
      }
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  // Criar sessão do portal do cliente
  async createCustomerPortalSession(customerId: string): Promise<string> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-customer-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar sessão do portal');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Erro ao criar customer portal session:', error);
      throw error;
    }
  }
}

// Exportar instância singleton
export const stripeService = StripeService.getInstance();

// Planos de assinatura disponíveis
export const SUBSCRIPTION_PLANS = {
  PROMO: {
    name: 'Oferta Especial',
    description: 'Acesso completo com desconto de lançamento',
    price: 9.97,
    originalPrice: 59.90,
    currency: 'BRL',
    interval: 'month' as const,
    discount: 83,
    features: [
      'Arsenal Mental completo com +200 vídeos',
      'Mentor IA personalizado 24/7',
      'Planos de desenvolvimento individualizados',
      'Técnicas de alta performance',
      'Comunidade exclusiva de membros',
      'Suporte prioritário via WhatsApp',
      'Atualizações semanais de conteúdo',
      'Exercícios práticos e desafios',
      'Relatórios de progresso detalhados',
      'Acesso via app mobile e desktop',
      'Garantia incondicional de 30 dias',
      'Bônus exclusivos para membros'
    ]
  },
  BASIC: {
    name: 'Básico',
    description: 'Acesso básico ao Arsenal Mental',
    price: 29.90,
    currency: 'BRL',
    interval: 'month' as const,
    features: [
      'Acesso a vídeos básicos',
      'Suporte por email',
      'Atualizações mensais'
    ]
  },
  PREMIUM: {
    name: 'Premium',
    description: 'Acesso completo com recursos avançados',
    price: 59.90,
    currency: 'BRL',
    interval: 'month' as const,
    features: [
      'Acesso completo ao Arsenal Mental',
      'Mentor IA personalizado',
      'Suporte prioritário',
      'Atualizações semanais',
      'Conteúdo exclusivo'
    ]
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;