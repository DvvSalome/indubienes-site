'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner only if user hasn't accepted/rejected yet
    const consent = document.cookie.split('; ').find(c => c.startsWith('cookie_consent='));
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    document.cookie = 'cookie_consent=accepted; path=/; max-age=31536000; SameSite=Lax';
    setVisible(false);
  };

  const handleReject = () => {
    document.cookie = 'cookie_consent=rejected; path=/; max-age=31536000; SameSite=Lax';
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up">
      <div className="bg-[#1A1A1A] border-t border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/70 font-body text-center sm:text-left leading-relaxed">
            Utilizamos cookies para mejorar su experiencia en nuestro sitio web. Al continuar navegando, acepta nuestra{' '}
            <Link href="/politica-privacidad" className="text-white underline underline-offset-2 hover:text-gold transition-colors">
              Política de Privacidad
            </Link>{' '}
            y el uso de cookies.
          </p>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleReject}
              className="px-5 py-2 text-sm font-body font-medium text-white/60 hover:text-white border border-white/15 hover:border-white/30 rounded-full transition-all duration-300"
            >
              Rechazar
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 text-sm font-body font-semibold text-white bg-gold hover:bg-gold-hover rounded-full transition-all duration-300"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
