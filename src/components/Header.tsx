'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#0D0D0D]/90 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Logo — bigger */}
          <Link href="/" className="flex items-center group">
            <Logo height={48} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Inicio', href: '/' },
              { label: 'Propiedades', href: '/propiedades' },
              { label: 'Venta', href: '/propiedades?tipo=venta' },
              { label: 'Arriendo', href: '/propiedades?tipo=arriendo' },
              { label: 'Contacto', href: '/contacto' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-body tracking-wide text-white/70 hover:text-gold transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Phone - desktop only */}
            <a
              href="tel:+576043220207"
              className="hidden lg:flex items-center gap-2 text-sm text-white/60 hover:text-gold transition-colors duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              604 322 0207
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white"
              aria-label="Menú"
            >
              {isMobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="7" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-[#0D0D0D]/95 backdrop-blur-2xl border-t border-white/[0.06]">
          <nav className="flex flex-col py-4 px-6 space-y-1">
            {[
              { label: 'Inicio', href: '/' },
              { label: 'Propiedades', href: '/propiedades' },
              { label: 'Venta', href: '/propiedades?tipo=venta' },
              { label: 'Arriendo', href: '/propiedades?tipo=arriendo' },
              { label: 'Contacto', href: '/contacto' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-base font-body text-white/80 hover:text-gold transition-colors duration-300 border-b border-white/[0.06]"
              >
                {label}
              </Link>
            ))}
            <a
              href="tel:+576043220207"
              className="py-3 text-base font-body text-gold flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              604 322 0207
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
