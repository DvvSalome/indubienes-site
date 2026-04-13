'use client';

import Image from 'next/image';

const ALLIES = [
  { name: 'El Libertador', logo: '/logos/el-libertador.png', w: 140, h: 48 },
  { name: 'Sura', logo: '/logos/sura.png', w: 120, h: 48 },
  { name: 'Cien Cuadras', logo: '/logos/cien-cuadras.png', w: 140, h: 48 },
  { name: 'Metro Cuadrado', logo: '/logos/metro-cuadrado.png', w: 140, h: 48 },
  { name: 'Finca Raíz', logo: '/logos/finca-raiz.png', w: 130, h: 48 },
  { name: 'Espacio Urbano', logo: '/logos/espacio-urbano.png', w: 120, h: 48 },
  { name: 'WASI', logo: '/logos/wasi.png', w: 110, h: 48 },
  { name: 'Sedi ERP', logo: '/logos/sedi-erp.png', w: 110, h: 48 },
];

export default function AlliesSlider() {
  const items = [...ALLIES, ...ALLIES];

  return (
    <section className="allies-section py-12 sm:py-16 bg-surface dark:bg-[#111] border-y border-border-color/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <p className="text-[13px] font-body font-bold tracking-[0.3em] uppercase text-muted/70 mb-2">
          Nuestros aliados
        </p>
        <div className="w-10 h-[1px] bg-gold/40 mx-auto" />
      </div>

      <div className="allies-track-wrapper relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-surface dark:from-[#111] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-surface dark:from-[#111] to-transparent z-10 pointer-events-none" />

        <div className="allies-track flex items-center gap-12 sm:gap-16 animate-scroll-left">
          {items.map((ally, i) => (
            <div
              key={`${ally.name}-${i}`}
              className="flex-shrink-0 flex items-center justify-center h-12 sm:h-14 w-[140px] sm:w-[170px] opacity-70 hover:opacity-100 transition-all duration-500"
            >
              <Image
                src={ally.logo}
                alt={ally.name}
                width={ally.w}
                height={ally.h}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-left {
          animation: scrollLeft 30s linear infinite;
          width: max-content;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
