'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Property } from '@/lib/types';
import { formatPrice } from '@/lib/wasi';
import FunnelForm from './FunnelForm';

interface FunnelClientProps {
  property: Property;
}

/* ── Helpers ───────────────────────────────────────────────── */

function toTitleCase(str: string): string {
  if (!str) return '';
  if (str === str.toUpperCase() && str.length > 5) {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
  return str;
}

/** Detect embeddable video URL and return iframe-friendly src */
function getVideoEmbed(url: string): string | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  return null;
}

export default function FunnelClient({ property }: FunnelClientProps) {
  const searchParams = useSearchParams();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Business type detection ─────────────────────────── */
  const titleLower = (property.title || '').toLowerCase();
  const isRent = property.for_rent || (!property.for_sale && property.rent_price > 0) ||
    titleLower.includes('arrienda') || titleLower.includes('arriendo');
  const isSale = property.for_sale || (!isRent && property.sale_price > 0) ||
    titleLower.includes('vende') || titleLower.includes('venta');
  const businessType = isRent && !isSale ? 'Arriendo' : 'Venta';

  const price = businessType === 'Venta'
    ? (property.sale_price_label || formatPrice(property.sale_price) || property.rent_price_label || formatPrice(property.rent_price))
    : (property.rent_price_label || formatPrice(property.rent_price) || property.sale_price_label || formatPrice(property.sale_price));

  const title = toTitleCase(property.title);
  const location = [property.zone_label, property.location_label, property.city_label].filter(Boolean).join(', ');

  /* ── Images ──────────────────────────────────────────── */
  const allImages = [
    property.main_image,
    ...(property.galleries?.flatMap(g => g.images) || []),
  ].filter(img => img?.url || img?.url_original);

  /* ── Video ───────────────────────────────────────────── */
  const videoEmbed = getVideoEmbed(property.video);

  /* ── WhatsApp ────────────────────────────────────────── */
  const waMsg = encodeURIComponent(
    `Hola, me interesa la propiedad "${title}" en ${property.city_label}. ${price}. Me gustaría más información.`
  );
  const waLink = `https://wa.me/573177597155?text=${waMsg}`;

  /* ── UTM ─────────────────────────────────────────────── */
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');

  /* ── Lightbox keyboard nav ───────────────────────────── */
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevImage = useCallback(() => {
    setLightboxIdx(i => i !== null ? (i - 1 + allImages.length) % allImages.length : null);
  }, [allImages.length]);
  const nextImage = useCallback(() => {
    setLightboxIdx(i => i !== null ? (i + 1) % allImages.length : null);
  }, [allImages.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIdx, closeLightbox, prevImage, nextImage]);

  /* ── Specs table data ────────────────────────────────── */
  const specs = [
    { label: 'Habitaciones', value: property.bedrooms, icon: '🛏️' },
    { label: 'Baños', value: property.bathrooms, icon: '🚿' },
    { label: 'Área total', value: property.area ? `${property.area} m²` : null, icon: '📐' },
    { label: 'Área construida', value: property.built_area ? `${property.built_area} m²` : null, icon: '🏗️' },
    { label: 'Parqueaderos', value: property.garages, icon: '🚗' },
    { label: 'Estrato', value: property.stratum, icon: '⭐' },
    { label: 'Administración', value: property.maintenance_fee_label || (property.maintenance_fee ? formatPrice(property.maintenance_fee) : null), icon: '💰' },
    { label: 'Estado', value: property.property_condition_label, icon: '🏠' },
  ].filter(s => s.value && String(s.value) !== '0');

  const scrollToForm = () => {
    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-background min-h-screen">

      {/* ═══ HERO ═══ */}
      <section className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
        {/* Background image with parallax effect */}
        <div className="absolute inset-0">
          <img
            src={allImages[0]?.url_original || allImages[0]?.url_big || allImages[0]?.url || '/placeholder-property.jpg'}
            alt={title}
            className="w-full h-full object-cover"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--background) 0%, var(--background, #0A0A0A) 10%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {/* Badge */}
          <div className="mb-4">
            <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg border ${
              businessType === 'Arriendo'
                ? 'bg-emerald-500 text-white border-emerald-400/30'
                : 'bg-[#3B6FA0] text-white border-[#4A8BC2]/30'
            }`} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {property.property_type_label} en {businessType}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mb-3 max-w-3xl leading-tight">
            {title}
          </h1>

          {/* Location */}
          <p className="text-white/70 text-sm sm:text-base mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#4A8BC2] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {location}
          </p>

          {/* Price + CTA row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
            <div>
              <p className="text-[#4A8BC2] text-3xl sm:text-4xl lg:text-5xl font-display font-bold">
                {price}
              </p>
              {businessType === 'Arriendo' && (
                <span className="text-white/50 text-sm">/mes</span>
              )}
            </div>
            <div className="flex gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold py-3 px-6 rounded-lg transition-all text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <button
                onClick={scrollToForm}
                className="bg-[#4A8BC2] hover:bg-[#3B6FA0] text-white font-semibold py-3 px-6 rounded-lg transition-all text-sm"
              >
                Solicitar info
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SPECS BAR ═══ */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {specs.slice(0, 6).map((spec, i) => (
              <div key={i} className="text-center min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{spec.value}</div>
                <div className="text-xs text-faint mt-1">{spec.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">

          {/* ── Left column: Gallery, Video, Description, Features, Map ── */}
          <div className="lg:col-span-2 space-y-12">

            {/* Gallery Grid */}
            {allImages.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-bold text-foreground mb-5">Galería</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-1.5">
                  {allImages.slice(0, 9).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLightboxIdx(idx)}
                      className={`relative overflow-hidden rounded-lg group cursor-pointer ${
                        idx === 0 ? 'col-span-2 row-span-2 aspect-[4/3]' : 'aspect-square'
                      }`}
                    >
                      <img
                        src={img.url_original || img.url}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading={idx < 4 ? 'eager' : 'lazy'}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      {idx === 8 && allImages.length > 9 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">+{allImages.length - 9}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Video Section */}
            {videoEmbed && (
              <div>
                <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#4A8BC2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Video del inmueble
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden bg-surface border border-border">
                  <iframe
                    src={videoEmbed}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    title="Video de la propiedad"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            {property.observations && (
              <div>
                <h2 className="text-xl font-display font-bold text-foreground mb-5">Descripción</h2>
                <div
                  className="text-muted leading-relaxed text-sm [&_p]:mb-3 [&_br]:leading-loose [&_strong]:text-white/80 [&_b]:text-white/80"
                  dangerouslySetInnerHTML={{ __html: (property.observations || '').replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/on\w+="[^"]*"/gi, '').replace(/on\w+='[^']*'/gi, '') }}
                />
              </div>
            )}

            {/* Property Details Table */}
            {specs.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-bold text-foreground mb-5">Detalles del inmueble</h2>
                <div className="bg-surface rounded-xl border border-border overflow-hidden">
                  {specs.map((spec, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-5 py-3.5 ${
                        i < specs.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <span className="text-faint text-sm flex items-center gap-2">
                        <span className="text-base">{spec.icon}</span>
                        {spec.label}
                      </span>
                      <span className="text-foreground font-medium text-sm">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {(property.features?.internal?.length > 0 || property.features?.external?.length > 0) && (
              <div>
                <h2 className="text-xl font-display font-bold text-foreground mb-5">Características</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {property.features?.internal?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-[#4A8BC2] uppercase tracking-widest mb-3">Internas</h3>
                      <div className="space-y-2">
                        {property.features.internal.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-muted">
                            <svg className="w-4 h-4 text-[#4A8BC2] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {typeof f === 'string' ? f : String((f as Record<string, string>)?.nombre || '')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {property.features?.external?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-[#4A8BC2] uppercase tracking-widest mb-3">Externas</h3>
                      <div className="space-y-2">
                        {property.features.external.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-muted">
                            <svg className="w-4 h-4 text-[#4A8BC2] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {typeof f === 'string' ? f : String((f as Record<string, string>)?.nombre || '')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Map */}
            {property.latitude !== 0 && property.longitude !== 0 && (
              <div>
                <h2 className="text-xl font-display font-bold text-foreground mb-5">Ubicación</h2>
                <div className="aspect-[16/9] rounded-xl overflow-hidden border border-border">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.008},${property.latitude - 0.004},${property.longitude + 0.008},${property.latitude + 0.004}&layer=mapnik&marker=${property.latitude},${property.longitude}`}
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Ubicación de la propiedad"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Right column: Sticky contact sidebar ── */}
          <div className="lg:col-span-1" id="contact-section">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Price card */}
              <div className="bg-surface border border-border rounded-xl p-6">
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    businessType === 'Arriendo'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-[#4A8BC2]/20 text-[#4A8BC2]'
                  }`}>
                    {businessType}
                  </span>
                </div>
                <p className="text-[#4A8BC2] text-2xl sm:text-3xl font-display font-bold mb-1">
                  {price}
                </p>
                {businessType === 'Arriendo' && (
                  <p className="text-faint text-xs mb-4">/mes</p>
                )}
                {property.maintenance_fee_label && (
                  <p className="text-faint text-xs">
                    Administración: <span className="text-muted">{property.maintenance_fee_label}</span>
                  </p>
                )}

                <div className="border-t border-border my-4" />

                {/* Quick CTA */}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-foreground font-semibold text-sm rounded-lg transition-colors mb-3"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Escribir por WhatsApp
                </a>
                <a
                  href="tel:+576043220207"
                  className="w-full flex items-center justify-center gap-2 py-3 border border-border text-muted hover:text-foreground hover:border-border font-medium text-sm rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  604 322 0207
                </a>
              </div>

              {/* Contact form */}
              <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="font-display font-bold text-white text-lg mb-1">¿Te interesa?</h3>
                <p className="text-faint text-xs mb-5">Déjanos tus datos y te contactamos</p>
                <FunnelForm
                  propertyId={property.id_property}
                  propertyType={property.property_type_label}
                  utmSource={utmSource}
                  utmMedium={utmMedium}
                  utmCampaign={utmCampaign}
                />
              </div>

              {/* Trust signals */}
              <div className="text-center space-y-2">
                <p className="text-faint/60 text-xs">INDUBIENES SAS · Medellín</p>
                <p className="text-faint/30 text-[10px]">Tus datos están protegidos. No compartimos tu información.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ LIGHTBOX ═══ */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 text-white/60 hover:text-white p-2 transition-colors"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          <div className="max-w-5xl max-h-[90vh] px-4" onClick={e => e.stopPropagation()}>
            <img
              src={allImages[lightboxIdx]?.url_original || allImages[lightboxIdx]?.url_big || allImages[lightboxIdx]?.url}
              alt={`Foto ${lightboxIdx + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg mx-auto"
            />
          </div>

          {/* Nav arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white/80 px-4 py-1.5 rounded-full text-xs font-medium">
                {lightboxIdx + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ FLOATING MOBILE CTA ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-lg border-t border-border px-4 py-3 safe-area-pb">
        <div className="flex gap-3 max-w-lg mx-auto">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold py-3 rounded-lg text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
          <button
            onClick={scrollToForm}
            className="flex-1 bg-[#4A8BC2] text-white font-semibold py-3 rounded-lg text-sm"
          >
            Solicitar info
          </button>
        </div>
      </div>
    </div>
  );
}
