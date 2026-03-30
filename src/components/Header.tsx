'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Logo height={36} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-body tracking-wide text-muted hover:text-gold transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/propiedades"
              className="text-sm font-body tracking-wide text-muted hover:text-gold transition-colors"
            >
              Propiedades
            </Link>
            <Link
              href="/propiedades?tipo=venta"
              className="text-sm font-body tracking-wide text-muted hover:text-gold transition-colors"
            >
              Venta
            </Link>
            <Link
              href="/propiedades?tipo=arriendo"
              className="text-sm font-body tracking-wide text-muted hover:text-gold transition-colors"
            >
              Arriendo
            </Link>
            <Link
              href="/contacto"
              className="text-sm font-body tracking-wide text-muted hover:text-gold transition-colors"
            >
              Contacto
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Phone - desktop only */}
            <a
              href="tel:+576043220207"
              className="hidden lg:flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              604 322 0207
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
              aria-label="Menú"
            >
              {isMobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-lg border-t border-border">
          <nav className="flex flex-col py-4 px-6 space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 text-base font-body text-foreground hover:text-gold transition-colors border-b border-border/50"
            >
              Inicio
            </Link>
            <Link
              href="/propiedades"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 text-base font-body text-foreground hover:text-gold transition-colors border-b border-border/50"
            >
              Propiedades
            </Link>
            <Link
              href="/propiedades?tipo=venta"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 text-base font-body text-foreground hover:text-gold transition-colors border-b border-border/50"
            >
              Venta
            </Link>
            <Link
              href="/propiedades?tipo=arriendo"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 text-base font-body text-foreground hover:text-gold transition-colors border-b border-border/50"
            >
              Arriendo
            </Link>
            <Link
              href="/contacto"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 text-base font-body text-foreground hover:text-gold transition-colors"
            >
              Contacto
            </Link>
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
      )}
    </header>
  );
}
