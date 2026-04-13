'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * Unified Google Maps component with:
 *  - Satellite map + Street View toggle
 *  - IntersectionObserver lazy-load (iframe only loads when in viewport)
 *  - Skeleton placeholder while loading
 */

interface MapEmbedProps {
  /** Latitude (e.g. 6.2442 for Medell\u00edn) */
  latitude: number;
  /** Longitude (e.g. -75.5866 for Medell\u00edn) */
  longitude: number;
  /** Zoom level (default 17) */
  zoom?: number;
  /** Accessible title for the iframe */
  title?: string;
  /** Extra Tailwind classes for the outer container */
  className?: string;
  /** Show a heading above the map */
  heading?: string;
}

type MapView = 'satellite' | 'streetview';

export default function MapEmbed({
  latitude,
  longitude,
  zoom = 17,
  title = 'Ubicaci\u00f3n en el mapa',
  className = 'aspect-[16/9]',
  heading,
}: MapEmbedProps) {
  const [activeView, setActiveView] = useState<MapView>('satellite');
  const [isVisible, setIsVisible] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy-load: only render iframe when component enters viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // start loading 200px before visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reset loaded state on view change
  useEffect(() => {
    setIframeLoaded(false);
  }, [activeView]);

  // Google Maps embed \u2014 hybrid satellite view (t=h), no API key needed
  const satelliteSrc = `https://maps.google.com/maps?q=${latitude},${longitude}&t=h&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  // Google Street View embed \u2014 layer=c activates Street View
  const streetViewSrc = `https://maps.google.com/maps?q=&layer=c&cbll=${latitude},${longitude}&cbp=12,0,,0,0&ie=UTF8&output=embed`;

  const currentSrc = activeView === 'satellite' ? satelliteSrc : streetViewSrc;

  const tabs: { id: MapView; label: string; icon: JSX.Element }[] = [
    {
      id: 'satellite',
      label: 'Mapa',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      id: 'streetview',
      label: 'Street View',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div ref={containerRef}>
      {heading && (
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-xl font-display font-bold text-foreground">{heading}</h2>

          {/* View toggle */}
          <div className="flex bg-[#1a1a1a] border border-border rounded-lg p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  activeView === tab.id
                    ? 'bg-gold/20 text-gold'
                    : 'text-muted hover:text-foreground hover:bg-[#222]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* If no heading, show tabs standalone */}
      {!heading && (
        <div className="flex justify-end mb-3">
          <div className="flex bg-[#1a1a1a] border border-border rounded-lg p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  activeView === tab.id
                    ? 'bg-gold/20 text-gold'
                    : 'text-muted hover:text-foreground hover:bg-[#222]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`rounded-xl overflow-hidden border border-border relative ${className}`}>
        {/* Skeleton placeholder */}
        {(!isVisible || !iframeLoaded) && (
          <div className="absolute inset-0 bg-[#1a1a1a] animate-pulse flex flex-col items-center justify-center gap-3 z-10">
            <svg className="w-10 h-10 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-[#555]">Cargando {activeView === 'streetview' ? 'Street View' : 'mapa'}...</span>
          </div>
        )}

        {/* Iframe — only rendered when in viewport */}
        {isVisible && (
          <iframe
            key={activeView}
            src={currentSrc}
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            title={title}
            onLoad={() => setIframeLoaded(true)}
          />
        )}
      </div>
    </div>
  );
}
