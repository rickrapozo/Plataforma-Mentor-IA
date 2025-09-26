import { useEffect, useRef } from 'react';

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuração do canvas
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Configuração da animação Matrix
    const chars = '01';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    // Inicializar as gotas
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      // Fundo semi-transparente para criar o efeito de trilha
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Opacidade um pouco maior para contraste
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Configurar o texto - Verde fluorescente Matrix mais visível
      ctx.fillStyle = '#00ff41'; // Verde Matrix clássico fluorescente
      ctx.font = `${fontSize}px monospace`;

      // Desenhar os caracteres
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        // Resetar a gota quando sair da tela
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Mover a gota para baixo
        drops[i]++;
      }
    };

    // Animação mais lenta para ser mais sutil
    const interval = setInterval(draw, 100);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.3 }} // Opacidade ajustada para melhor visibilidade
    />
  );
};

export default MatrixBackground;