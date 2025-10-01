import { motion } from 'framer-motion';
import { Shield, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const GuaranteeSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="bg-gradient-to-br from-green-500 to-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Garantia Incondicional de 30 Dias
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xl text-gray-300 mb-8 leading-relaxed"
            >
              Estamos tão confiantes que você vai <span className="text-green-400 font-semibold">transformar sua vida</span> que oferecemos uma garantia total. Se em 30 dias você não estiver completamente satisfeito, devolvemos <span className="text-green-400 font-semibold">100% do seu dinheiro</span>.
            </motion.p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex flex-col items-center"
              >
                <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Sem Perguntas</h4>
                <p className="text-gray-400 text-sm text-center">
                  Não fazemos perguntas complicadas. Sua satisfação é nossa prioridade.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="flex flex-col items-center"
              >
                <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">30 Dias Completos</h4>
                <p className="text-gray-400 text-sm text-center">
                  Tempo suficiente para testar todas as estratégias e ver os resultados.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 }}
                className="flex flex-col items-center"
              >
                <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Reembolso Rápido</h4>
                <p className="text-gray-400 text-sm text-center">
                  Processamos seu reembolso em até 5 dias úteis, sem burocracia.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="bg-white/5 rounded-lg p-6 border border-green-500/20"
            >
              <p className="text-green-400 font-semibold text-lg mb-2">
                💡 Por que oferecemos essa garantia?
              </p>
              <p className="text-gray-300">
                Porque sabemos que nosso método funciona. Mais de <span className="text-white font-semibold">1.247 pessoas</span> já transformaram suas vidas com o Arsenal Mental. Agora é sua vez!
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};