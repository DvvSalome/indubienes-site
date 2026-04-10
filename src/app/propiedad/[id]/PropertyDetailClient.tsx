'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Property } from '@/lib/types';
import { formatPrice } from '@/lib/wasi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Convert ALL-CAPS title to Title Case
function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/(?:^|\s|["'([{-])\S/g, (match) => match.toUpperCase());
}

// Extract embed URL from YouTube/Vimeo links
function getVideoEmbed(url: string): { embedUrl: string; type: 'youtube' | 'vimeo' | 'direct' } | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&rel=0`, type: 'youtube' };
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return { embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1`, type: 'vimeo' };
  // Direct video file (mp4, webm, etc)
  if (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)) return { embedUrl: url, type: 'direct' };
  return null;
}

interface Props {
  property: Property;
}

// Pick the best working URL for an image.
// url_original = raw photo without WASI letterboxing (preferred — no white borders)
// url_big = WASI processed (reliable CDN, but adds white bars on portrait photos)
function bestImageUrl(img: { url?: string; url_big?: string; url_original?: string }): string {
  return img?.url_original || img?.url_big || img?.url || '';
}

// Fallback URL when url_original gives 403
function fallbackImageUrl(img: { url?: string; url_big?: string; url_original?: string }): string {
  return img?.url_big || img?.url || '';
}

export default function PropertyDetailClient({ property }: Props) {
  // Combine main_image + gallery images, deduplicate
  const rawImages = [
    property.main_image,
    ...(property.galleries?.flatMap(g => g.images) || []),
  ].filter(img => img?.url || img?.url_big || img?.url_original);

  const seen = new Set<string>();
  const dedupedImages = rawImages.filter(img => {
    // Use the token URL (url_big or url) for dedup since url_original can differ but point to same image
    const key = bestImageUrl(img);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Track which images have errored so we can skip them
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());
  const allImages = dedupedImages.filter((_, idx) => !brokenImages.has(idx));

  const [currentImage, setCurrentImage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mapView, setMapView] = useState<'satellite' | 'streetview'>('satellite');
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // When an image fails to load, mark it as broken
  const handleImageError = useCallback((dedupedIndex: number) => {
    setBrokenImages(prev => {
      const next = new Set(prev);
      next.add(dedupedIndex);
      return next;
    });
  }, []);

  // Reset current image if it goes out of bounds after removing broken images
  useEffect(() => {
    if (currentImage >= allImages.length && allImages.length > 0) {
      setCurrentImage(0);
    }
  }, [allImages.length, currentImage]);

  // Auto-slide carousel every 4 seconds
  useEffect(() => {
    if (isPaused || allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, allImages.length]);

  // Pause autoplay when user interacts, resume after 10 seconds
  const handleUserNav = useCallback((newIndex: number) => {
    setCurrentImage(newIndex);
    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setIsPaused(false), 10000);
  }, []);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: `Hola, estoy interesado en la propiedad "${property.title}" (ID: ${property.id_property}). Me gustaría recibir más información.`,
  });

  // Video embed
  const videoEmbed = useMemo(() => getVideoEmbed(property.video || ''), [property.video]);

  // Determine business type using multiple signals
  const titleLower = (property.title || '').toLowerCase();
  const isRent = property.for_rent || (!property.for_sale && property.rent_price > 0) || titleLower.includes('arrienda') || titleLower.includes('arriendo');
  const isSale = property.for_sale || (!isRent && property.sale_price > 0) || titleLower.includes('vende') || titleLower.includes('venta');
  const businessType = isRent && !isSale ? 'Arriendo' : 'Venta';

  const price = businessType === 'Venta'
    ? (property.sale_price_label || formatPrice(property.sale_price) || property.rent_price_label || formatPrice(property.rent_price))
    : (property.rent_price_label || formatPrice(property.rent_price) || property.sale_price_label || formatPrice(property.sale_price));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `${property.title} - ${price}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hola, soy ${formData.nombre}. ${formData.mensaje}\n\nEmail: ${formData.email}\nTeléfono: ${formData.telefono}`
    );
    window.open(`https://wa.me/573177597155?text=${msg}`, '_blank');
  };

  // GSAP Scroll Animations
  const titleRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title & price fade in from below
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 90%', toggleActions: 'play none none none' }
          }
        );
      }

      // Spec cards stagger reveal
      if (specsRef.current) {
        const cards = specsRef.current.querySelectorAll('.spec-card');
        gsap.fromTo(cards,
          { y: 50, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: specsRef.current, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }

      // Description section
      if (descRef.current) {
        gsap.fromTo(descRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: descRef.current, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }

      // Features section
      if (featuresRef.current) {
        gsap.fromTo(featuresRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: featuresRef.current, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }

      // Map section
      if (mapRef.current) {
        gsap.fromTo(mapRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: mapRef.current, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }

      // Sidebar slide in from right
      if (sidebarRef.current) {
        gsap.fromTo(sidebarRef.current,
          { x: 60, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.9, delay: 0.3, ease: 'power3.out',
            scrollTrigger: { trigger: sidebarRef.current, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="pt-20 sm:pt-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted font-body">
          <Link href="/" className="hover:text-gold transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/propiedades" className="hover:text-gold transition-colors">Propiedades</Link>
          <span>/</span>
          <span className="text-foreground">{toTitleCase(property.title)}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#1a1a1a] mb-3 image-shine">
                {allImages.length > 0 ? (
                  <>
                    {/* Blurred background fill — eliminates white/empty sides on vertical or small images */}
                    <img
                      key={`bg-${currentImage}`}
                      src={bestImageUrl(allImages[currentImage]) || '/placeholder-property.jpg'}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
                      onError={(e) => {
                        // If url_original fails (403), fallback to url_big for the blur bg
                        const fb = fallbackImageUrl(allImages[currentImage]);
                        if (fb && (e.target as HTMLImageElement).src !== fb) (e.target as HTMLImageElement).src = fb;
                      }}
                    />
                    {/* Main sharp image */}
                    <img
                      key={currentImage}
                      src={bestImageUrl(allImages[currentImage]) || '/placeholder-property.jpg'}
                      alt={property.title}
                      className="absolute inset-0 w-full h-full object-contain animate-fade-in z-[1]"
                      onError={(e) => {
                        // Try fallback URL first before removing image entirely
                        const fb = fallbackImageUrl(allImages[currentImage]);
                        if (fb && (e.target as HTMLImageElement).src !== fb) {
                          (e.target as HTMLImageElement).src = fb;
                        } else {
                          const dedupIdx = dedupedImages.indexOf(allImages[currentImage]);
                          if (dedupIdx !== -1) handleImageError(dedupIdx);
                        }
                      }}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-faint">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}

                {/* Nav arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => handleUserNav((currentImage - 1 + allImages.length) % allImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-[5]"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleUserNav((currentImage + 1) % allImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-[5]"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image counter */}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-body z-[5]">
                  {currentImage + 1} / {allImages.length}
                </div>

                {/* Badge */}
                <div className="absolute top-3 left-3 z-[5]">
                  <span className="px-3 py-1 bg-gold text-white text-xs font-body font-semibold rounded-full tracking-wide uppercase">
                    {businessType}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleUserNav(idx)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === currentImage ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={bestImageUrl(img)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const fb = fallbackImageUrl(img);
                          if (fb && (e.target as HTMLImageElement).src !== fb) {
                            (e.target as HTMLImageElement).src = fb;
                          } else {
                            const dedupIdx = dedupedImages.indexOf(img);
                            if (dedupIdx !== -1) handleImageError(dedupIdx);
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Video Section */}
              {videoEmbed && (
                <div className="mt-4">
                  <h3 className="text-sm font-body font-semibold text-gold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Video
                  </h3>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-surface border border-border">
                    {videoEmbed.type === 'direct' ? (
                      <video
                        src={videoEmbed.embedUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <iframe
                        src={videoEmbed.embedUrl}
                        className="w-full h-full"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        title="Video de la propiedad"
                        style={{ border: 0 }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div ref={titleRef} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {property.property_type_label && typeof property.property_type_label === 'string' && (
                    <span className="text-xs font-body font-semibold text-gold uppercase tracking-widest">{property.property_type_label}</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight text-foreground mb-2 leading-tight">
                  {toTitleCase(property.title)}
                </h1>
                <p className="text-muted font-body flex items-center gap-1.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {(typeof property.address === 'string' ? property.address : '') ||
                   (typeof property.location_label === 'string' ? property.location_label : '') ||
                   `${typeof property.zone_label === 'string' ? property.zone_label : ''}, ${typeof property.city_label === 'string' ? property.city_label : ''}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl sm:text-4xl font-display font-bold text-gold tracking-tight">
                  {price}
                </p>
                {property.for_sale && property.for_rent && property.rent_price > 0 && (
                  <p className="text-sm text-muted font-body mt-1">
                    Arriendo: {property.rent_price_label || formatPrice(property.rent_price)}
                  </p>
                )}
                {property.maintenance_fee > 0 && (
                  <p className="text-sm text-muted font-body mt-1">
                    Administración: {property.maintenance_fee_label || formatPrice(property.maintenance_fee)}
                  </p>
                )}
              </div>
            </div>

            {/* Quick specs */}
            <div ref={specsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Habitaciones', value: property.bedrooms, icon: 'M2 4v16M2 8h18a2 2 0 012 2v10M2 17h20M6 8v9' },
                { label: 'Baños', value: property.bathrooms, icon: 'M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1zM6 12V5a2 2 0 012-2h3v2.25' },
                { label: 'Área', value: property.area ? `${property.area} m²` : null, icon: 'M21 3L3 3l18 18M3 3v18M21 3v4M3 21h4M17 7l-10 10' },
                { label: 'Parqueaderos', value: property.garages, icon: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10H6l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2M14 17H10M6 10V5h12v5M9 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM20 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z' },
              ].filter(s => s.value).map((spec) => (
                <div key={spec.label} className="spec-card bg-surface rounded-xl p-5 text-center border border-border/60 shadow-sm hover:shadow-md hover:border-gold/30 transition-all duration-300">
                  <svg className="w-7 h-7 text-gold mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={spec.icon} />
                  </svg>
                  <p className="text-xl font-display font-bold text-foreground">{spec.value}</p>
                  <p className="text-xs text-muted font-body mt-1">{spec.label}</p>
                </div>
              ))}
            </div>

            {/* Detalles del inmueble */}
            <div className="mb-8">
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Detalles del inmueble</h2>

              {/* Location pill */}
              {(property.zone_label || property.location_label || property.city_label || property.region_label || property.country_label) && (
                <div className="mb-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 rounded-full bg-surface border border-border/60 text-sm font-body">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {(property.zone_label || property.location_label) && (
                    <span className="text-foreground font-semibold">{property.zone_label || property.location_label}</span>
                  )}
                  {[property.city_label, property.region_label, property.country_label].filter(Boolean).length > 0 && (
                    <>
                      {(property.zone_label || property.location_label) && <span className="text-muted/60">·</span>}
                      <span className="text-muted">
                        {[property.city_label, property.region_label, property.country_label].filter(Boolean).join(', ')}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Full technical metadata — definition list */}
              {(() => {
                const rows = [
                  { label: 'Tipo de negocio', value: businessType },
                  { label: 'Tipo de inmueble', value: property.property_type_label },
                  { label: 'Estado', value: property.property_condition_label },
                  { label: 'Año construcción', value: property.year_built || null },
                  { label: 'Estrato', value: property.stratum || null },
                  { label: 'Piso', value: property.floor || null },
                  { label: 'Área construida', value: property.built_area ? `${property.built_area} m²` : null },
                  { label: 'Área privada', value: property.private_area ? `${property.private_area} m²` : null },
                  { label: 'Área terreno', value: property.area ? `${property.area} m²` : null },
                  { label: 'Código', value: property.id_property },
                ].filter((r) => r.value !== null && r.value !== undefined && r.value !== '' && r.value !== 0);
                if (rows.length === 0) return null;
                return (
                  <dl className="bg-surface border border-border/60 rounded-xl px-5 py-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 text-sm font-body">
                    {rows.map((r, i) => {
                      const isLastInColumn = i >= rows.length - 2 || (rows.length % 2 === 1 && i === rows.length - 1);
                      return (
                        <div
                          key={r.label}
                          className={`flex items-baseline justify-between gap-4 py-3 ${isLastInColumn ? '' : 'border-b border-border/20'}`}
                        >
                          <dt className="text-muted flex-shrink-0">{r.label}</dt>
                          <dd className="text-foreground font-medium text-right">{r.value}</dd>
                        </div>
                      );
                    })}
                  </dl>
                );
              })()}
            </div>

            {/* Description */}
            {property.observations && (
              <div ref={descRef} className="mb-8">
                <h2 className="text-xl font-display font-bold text-foreground mb-4">Descripción</h2>
                <div
                  className="text-muted font-body leading-relaxed prose-invert prose-sm max-w-none [&_p]:mb-3 [&_br]:leading-loose"
                  dangerouslySetInnerHTML={{ __html: (property.observations || '').replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/on\w+="[^"]*"/gi, '').replace(/on\w+='[^']*'/gi, '') }}
                />
              </div>
            )}

            {/* Features */}
            {(property.features?.internal?.length > 0 || property.features?.external?.length > 0) && (
              <div ref={featuresRef} className="mb-8">
                <h2 className="text-xl font-display font-bold text-foreground mb-4">Características</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {property.features?.internal?.length > 0 && (
                    <div className="bg-surface border border-border/60 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">Internas</h3>
                        <span className="ml-auto text-xs text-muted font-body">{property.features.internal.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {property.features.internal.map((f, i) => (
                          <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full bg-gold/5 border border-gold/25 text-xs font-body text-foreground">
                            {typeof f === 'string' ? f : String((f as Record<string, string>)?.nombre || (f as Record<string, string>)?.name || '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {property.features?.external?.length > 0 && (
                    <div className="bg-surface border border-border/60 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20" />
                            <path d="M17 5a5 5 0 0 0-10 0c0 2.5 2 4 5 7 3-3 5-4.5 5-7Z" />
                            <path d="M7 18c-2.5 0-4-1.5-4-4 0-1.5.5-2.5 2-3.5" />
                            <path d="M17 18c2.5 0 4-1.5 4-4 0-1.5-.5-2.5-2-3.5" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">Externas</h3>
                        <span className="ml-auto text-xs text-muted font-body">{property.features.external.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {property.features.external.map((f, i) => (
                          <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full bg-gold/5 border border-gold/25 text-xs font-body text-foreground">
                            {typeof f === 'string' ? f : String((f as Record<string, string>)?.nombre || (f as Record<string, string>)?.name || '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Immersive map: satellite + street view tabs */}
            {property.latitude && property.longitude && (
              <div ref={mapRef} className="mb-8">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h2 className="text-xl font-display font-bold text-foreground">Ubicación</h2>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                  >
                    Abrir en Google Maps
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                </div>

                {/* View toggle */}
                <div className="inline-flex items-center bg-muted/40 backdrop-blur-sm border border-border rounded-full p-1 mb-3 shadow-sm">
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
                    Satélite
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
                    Tour 360° · Street View
                  </button>
                </div>

                <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-border shadow-lg bg-muted/20">
                  {mapView === 'satellite' ? (
                    <iframe
                      key="sat"
                      src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&t=h&z=17&ie=UTF8&output=embed`}
                      className="w-full h-full"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Ubicación satelital de la propiedad"
                      allow="fullscreen"
                    />
                  ) : (
                    <iframe
                      key="sv"
                      src={`https://www.google.com/maps?q=&layer=c&cbll=${property.latitude},${property.longitude}&cbp=11,0,0,0,0&output=svembed`}
                      className="w-full h-full"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Tour Street View de la propiedad"
                      allow="fullscreen; accelerometer; gyroscope"
                      allowFullScreen
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {mapView === 'satellite'
                    ? 'Vista satelital híbrida · La ubicación exacta se comparte al agendar una visita.'
                    : 'Tour inmersivo Street View · Arrastra para mirar alrededor, usa los íconos para caminar por la zona. Si la calle no tiene cobertura, prueba con el modo satélite.'}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div ref={sidebarRef} className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Actions */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display font-bold text-lg text-foreground mb-4">¿Te interesa?</h3>
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/573177597155?text=${encodeURIComponent(`Hola, me interesa la propiedad "${property.title}" (ID: ${property.id_property}), ${price}. Me gustaría más información.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-body font-semibold text-sm rounded-lg transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Escribir por WhatsApp
                  </a>
                  <a
                    href="tel:+576043220207"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gold hover:bg-gold-hover text-white font-body font-semibold text-sm rounded-lg transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Llamar ahora
                  </a>
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-border text-muted hover:text-foreground font-body text-sm rounded-lg transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    Compartir
                  </button>
                </div>
              </div>

              {/* Contact form */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display font-bold text-lg text-foreground mb-4">Solicitar información</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="w-full bg-surface text-foreground border border-border rounded-lg px-4 py-2.5 text-sm font-body placeholder:text-faint"
                  />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-surface text-foreground border border-border rounded-lg px-4 py-2.5 text-sm font-body placeholder:text-faint"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-surface text-foreground border border-border rounded-lg px-4 py-2.5 text-sm font-body placeholder:text-faint"
                  />
                  <textarea
                    placeholder="Mensaje"
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    rows={4}
                    className="w-full bg-surface text-foreground border border-border rounded-lg px-4 py-2.5 text-sm font-body placeholder:text-faint resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-gold hover:bg-gold-hover text-white font-body font-semibold text-sm rounded-lg transition-colors"
                  >
                    Enviar mensaje
                  </button>
                </form>
              </div>

              {/* Company info */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display font-bold text-lg text-foreground mb-3">INDUBIENES SAS</h3>
                <div className="space-y-2 text-sm text-muted font-body">
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Cra 77 #36-31, Laureles, Medellín
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    +57 604 322 0207
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    gerencia@indubienes.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
