import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  image?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Maria Silva",
    role: "Empreendedora",
    text: "Em 30 dias consegui organizar minha rotina e aumentar minha produtividade em 300%. O Mentor IA é incrível! Nunca imaginei que seria possível ter resultados tão rápidos.",
    rating: 5
  },
  {
    id: 2,
    name: "João Santos",
    role: "Executivo",
    text: "Nunca pensei que seria possível mudar tanto em tão pouco tempo. Os vídeos são práticos e funcionam de verdade. Minha carreira decolou depois que comecei a aplicar as técnicas.",
    rating: 5
  },
  {
    id: 3,
    name: "Ana Costa",
    role: "Estudante",
    text: "O investimento se pagou na primeira semana. Minha mentalidade mudou completamente e os resultados apareceram. Consegui melhorar minhas notas e minha autoestima.",
    rating: 5
  },
  {
    id: 4,
    name: "Carlos Oliveira",
    role: "Vendedor",
    text: "Dobrei minha renda em 2 meses aplicando as estratégias do Arsenal Mental. O conteúdo é de altíssima qualidade e realmente funciona na prática.",
    rating: 5
  },
  {
    id: 5,
    name: "Fernanda Lima",
    role: "Coach",
    text: "Como profissional da área, posso afirmar que este é o melhor conteúdo de desenvolvimento pessoal que já vi. Uso as técnicas com meus próprios clientes.",
    rating: 5
  }
];

// Componente TestimonialCard memoizado
const TestimonialCard = memo(({ testimonial }: { testimonial: Testimonial }) => {
  const stars = useMemo(() => 
    [...Array(testimonial.rating)].map((_, i) => (
      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
    )), 
    [testimonial.rating]
  );

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardContent className="p-8">
        <div className="text-center">
          <Quote className="w-12 h-12 text-purple-400 mx-auto mb-6" />
          
          <div className="flex justify-center mb-4">
            {stars}
          </div>
          
          <p className="text-lg text-gray-300 mb-6 italic leading-relaxed">
            "{testimonial.text}"
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {testimonial.name.charAt(0)}
              </span>
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">
                {testimonial.name}
              </p>
              <p className="text-gray-400 text-sm">
                {testimonial.role}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TestimonialCard.displayName = 'TestimonialCard';

export const TestimonialCarousel = memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const currentTestimonial = useMemo(() => testimonials[currentIndex], [currentIndex]);

  const dots = useMemo(() => 
    testimonials.map((_, index) => (
      <button
        key={index}
        onClick={() => handleDotClick(index)}
        className={`w-3 h-3 rounded-full transition-all duration-300 ${
          index === currentIndex 
            ? 'bg-purple-400 scale-125' 
            : 'bg-white/30 hover:bg-white/50'
        }`}
      />
    )), 
    [currentIndex, handleDotClick]
  );

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <TestimonialCard testimonial={currentTestimonial} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevTestimonial}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={nextTestimonial}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {dots}
      </div>
    </div>
  );
});

TestimonialCarousel.displayName = 'TestimonialCarousel';