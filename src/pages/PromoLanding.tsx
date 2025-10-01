import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Shield, Users, Zap, Star, ArrowRight, Crown, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PulseButton } from '@/components/ui/pulse-button';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { FloatingElements } from '@/components/ui/floating-elements';
import { CheckoutForm } from '@/components/subscription/CheckoutForm';
import { TrustBadges } from '@/components/ui/trust-badges';
import { TestimonialCarousel } from '@/components/ui/testimonial-carousel';
import { BenefitsGrid } from '@/components/ui/benefits-grid';
import { GuaranteeSection } from '@/components/ui/guarantee-section';
import { SocialProof } from '@/components/ui/social-proof';
import { SUBSCRIPTION_PLANS } from '@/services/stripeService';

const PromoLanding = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const promoFeatures = SUBSCRIPTION_PLANS.PROMO.features;

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <button
              onClick={() => setShowCheckout(false)}
              className="mb-6 text-white/70 hover:text-white flex items-center gap-2 transition-colors"
            >
              ← Voltar à Oferta
            </button>
            <CheckoutForm priceId="price_promo_997" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <FloatingElements />
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Urgency Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2 mb-6"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-semibold text-sm sm:text-base">OFERTA LIMITADA - ÚLTIMAS HORAS</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Transforme Sua Vida Por Apenas
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mt-2">
                R$ 9,97/mês
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed px-4"
            >
              Acesse o <span className="text-purple-400 font-semibold">Arsenal Mental Completo</span> e desenvolva uma mentalidade vencedora que vai revolucionar todos os aspectos da sua vida
            </motion.p>

            {/* Price Comparison */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Preço Normal:</p>
                <p className="text-2xl sm:text-3xl text-gray-500 line-through">R$ 59,90</p>
              </div>
              
              <ArrowRight className="w-6 h-6 text-purple-400 rotate-90 sm:rotate-0" />
              
              <div className="text-center">
                <p className="text-green-400 text-sm mb-1">Hoje Apenas:</p>
                <p className="text-4xl sm:text-5xl font-bold text-green-400">R$ 9,97</p>
              </div>
              
              <Badge className="bg-red-500 text-white px-3 py-1 text-sm font-bold">
                83% OFF
              </Badge>
            </motion.div>

            {/* Countdown Timer */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="bg-black/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 mb-8 max-w-md mx-auto"
            >
              <p className="text-red-400 font-semibold mb-4 text-sm sm:text-base">⏰ Esta oferta expira em:</p>
              <div className="flex justify-center gap-2 sm:gap-4">
                <div className="text-center">
                  <div className="bg-red-500 text-white rounded-lg p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
                    <span className="text-xl sm:text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Horas</p>
                </div>
                <div className="text-center">
                  <div className="bg-red-500 text-white rounded-lg p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
                    <span className="text-xl sm:text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Min</p>
                </div>
                <div className="text-center">
                  <div className="bg-red-500 text-white rounded-lg p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
                    <span className="text-xl sm:text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Seg</p>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mb-8"
            >
              <PulseButton
                onClick={() => setShowCheckout(true)}
                className="text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 w-full sm:w-auto"
              >
                🚀 QUERO TRANSFORMAR MINHA VIDA AGORA
              </PulseButton>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              <TrustBadges />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Countdown Timer */}
      <section className="relative z-10 py-6 sm:py-8 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
              Oferta Expira em:
            </h3>
            <div className="flex justify-center gap-2 sm:gap-4">
              {[
                { label: 'Horas', value: timeLeft.hours },
                { label: 'Minutos', value: timeLeft.minutes },
                { label: 'Segundos', value: timeLeft.seconds }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className="bg-gradient-to-b from-red-500 to-red-600 rounded-lg p-2 sm:p-3 md:p-4 min-w-[60px] sm:min-w-[70px] md:min-w-[80px]"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: index * 0.2 }}
                >
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                    <AnimatedCounter from={0} to={item.value} duration={1000} />
                  </div>
                  <div className="text-xs sm:text-sm text-red-100">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <PulseButton
              onClick={() => setShowCheckout(true)}
              className="text-2xl px-12 py-6 mb-6"
            >
              <Crown className="w-6 h-6 mr-3" />
              GARANTIR MINHA VAGA AGORA
              <ArrowRight className="w-6 h-6 ml-3" />
            </PulseButton>
            
            <p className="text-gray-300 mb-4">
              ✅ Pagamento 100% Seguro • ✅ Garantia de 30 dias • ✅ Acesso Imediato
            </p>
            
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <AnimatedCounter from={0} to={1247} /> pessoas já aderiram
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                4.9/5 estrelas
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seção de Benefícios */}
      <section className="relative z-10 py-12 sm:py-16 bg-black/10 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
                Transforme Sua Vida com o
                <span className="block sm:inline bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Arsenal Mental</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
                Descubra os benefícios exclusivos que vão revolucionar sua mentalidade e acelerar seus resultados
              </p>
            </div>
            
            <BenefitsGrid />
          </motion.div>
        </div>
      </section>

      {/* Seção de Depoimentos */}
      <section className="relative z-10 py-12 sm:py-16 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
                Veja o que Nossos
                <span className="block sm:inline bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> Membros Dizem</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Mais de 1.247 pessoas já transformaram suas vidas. Agora é sua vez!
              </p>
            </div>
            
            <TestimonialCarousel />
          </motion.div>
        </div>
      </section>

      {/* Seção de Garantia */}
      <section className="relative z-10 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Sua Satisfação é
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> Garantida</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
                Invista sem riscos com nossa garantia incondicional
              </p>
            </div>
            
            <GuaranteeSection />
          </motion.div>
        </div>
      </section>

      {/* Seção de Prova Social */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.8 }}
        className="py-16 sm:py-20 px-4 bg-black/10"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6, duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Junte-se a Milhares de
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Pessoas de Sucesso</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Veja os números que comprovam a eficácia do nosso método
            </p>
          </motion.div>
          
          <SocialProof />
        </div>
      </motion.section>

      {/* Guarantee */}
      <section className="relative z-10 py-12 sm:py-16 bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-green-400 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 px-4">
              Garantia Incondicional de 30 Dias
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              Se você não ficar 100% satisfeito com os resultados em 30 dias, 
              devolvemos todo o seu dinheiro. Sem perguntas, sem complicações.
            </p>
            
            <PulseButton
              onClick={() => setShowCheckout(true)}
              className="text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              QUERO COMEÇAR AGORA
            </PulseButton>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-16 sm:py-20 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight px-4">
              Não perca esta oportunidade única
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Esta oferta especial é limitada e pode sair do ar a qualquer momento. 
              Garante já sua transformação por apenas R$ 9,97.
            </p>
            
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto mb-6 sm:mb-8">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">R$ 9,97</div>
              <div className="text-sm sm:text-base text-gray-300">Primeiro mês • Depois R$ 59,90/mês</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-2">Cancele quando quiser</div>
            </div>
            
            <PulseButton
              onClick={() => setShowCheckout(true)}
              className="text-lg sm:text-xl lg:text-2xl px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6"
            >
              GARANTIR AGORA - R$ 9,97
            </PulseButton>
            
            <p className="text-xs sm:text-sm text-gray-400 mt-4 sm:mt-6 px-4">
              Pagamento seguro • SSL 256-bit • Dados protegidos
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PromoLanding;