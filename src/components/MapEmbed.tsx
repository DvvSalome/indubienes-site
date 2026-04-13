'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * Unified Google Maps component with:
 *  - Satellite map + Street View toggle
 *  - IntersectionObserver lazy-load (iframe only loads when in viewport)
 *  - Skeleton placeholder while loading
 *  - "Abrir en Google Maps" external link
 */

interface MapEmbedProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  title?: string;
  className?: string;
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
  const [mapView, setMapView] = useState<MapView>('satellite');
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
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reset loaded state on view change
  useEffect(() => {
    setIframeLoaded(false);
  }, [mapView]);

  // Satellite: Google Maps hybrid (t=h)
  const satelliteSrc = `https://www.google.com/maps?q=${latitude},${longitude}&t=h&z=${zoom}&ie=UTF8&output=embed`;
  // Street View: svembed output with camera params
  const streetViewSrc = `https://www.google.com/maps?q=&layer=c&cbll=${latitude},${longitude}&cbp=11,0,0,0,0&output=svembed`;

  const currentSrc = mapView === 'satellite' ? satelliteSrc : streetViewSrc;

  return (
    <div ref={containerRef}>
      {/* Header row: title + toggle + external link */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        {heading && (
          <h2 className="text-xl font-display font-bold text-foreground">{heading}</h2>
        )}

        <div className="flex items-center gap-3 ml-auto">
          {/* View toggle pill */}
          <div className="inline-flex items-center bg-muted/40 backdrop-blur-sm border border-border rounded-full p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setMapView('satellite')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 inline-flex items-center gap-1.5 ${
                mapView === 'satellite'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={mapView === 'satellite'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Sat\u00e9lite
            </button>
            <button
              type="button"
              onClick={() => setMapView('streetview')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 inline-flex items-center gap-1.5 ${
                mapView === 'streetview'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={mapView === 'streetview'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M12 12c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z"/></svg>
              Tour 360\u00b0
            </button>
          </div>

          {/* External link */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 hidden sm:inline-flex"
          >
            Abrir en Maps
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </div>

      {/* Map container */}
      <div className={`relative rounded-xl overflow-hidden border border-border shadow-lg bg-muted/20 ${className}`}>
        {/* Skeleton placeholder */}
        {(!isVisible || !iframeLoaded) && (
          <div className="absolute inset-0 bg-[#1a1a1a] animate-pulse flex flex-col items-center justify-center gap-3 z-10">
            <svg className="w-10 h-10 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-[#555]">Cargando {mapView === 'streetview' ? 'Street View' : 'mapa'}...</span>
          </div>
        )}

        {/* Iframe */}
        {isVisible && (
          <iframe
            key={mapView}
            src={currentSrc}
            className="w-full h-full"
            style={{ border: 0 }}
            referrerPolicy="no-referrer-when-downgrade"
            title={title}
            allow="fullscreen"
            onLoad={() => setIframeLoaded(true)}
          />
        )}
      </div>
    </div>
  );
}
