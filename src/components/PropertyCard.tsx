'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/lib/types';
import { formatPrice } from '@/lib/wasi';

function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function PropertyCardInner({ property }: { property: Property }) {
  // Determine business type: check rent_price > 0 AND title hints
  const titleLower = (property.title || '').toLowerCase();
  const isRent = property.for_rent || (!property.for_sale && property.rent_price > 0) || titleLower.includes('arrienda') || titleLower.includes('arriendo');
  const isSale = property.for_sale || (!isRent && property.sale_price > 0) || titleLower.includes('vende') || titleLower.includes('venta');

  const businessType = isRent && !isSale ? 'Arriendo' : 'Venta';

  const price = businessType === 'Venta'
    ? (property.sale_price_label || formatPrice(property.sale_price) || property.rent_price_label || formatPrice(property.rent_price))
    : (property.rent_price_label || formatPrice(property.rent_price) || property.sale_price_label || formatPrice(property.sale_price));

  // Smart title: convert from ALL CAPS to Title Case for better readability
  const displayTitle = property.title === property.title?.toUpperCase()
    ? toTitleCase(property.title)
    : property.title;

  // Clean alt text for screen readers: strip "SE VENDE" / "SE ARRIENDA" prefix,
  // use sentence case, and append location for context.
  const cleanAlt = (() => {
    const raw = (property.title || '').replace(/^\s*SE\s+(VENDE|ARRIENDA)\s+/i, '').trim();
    const sentence = raw ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase() : 'Propiedad';
    const loc = [property.zone_label, property.city_label].filter(Boolean).join(', ');
    return loc ? `${sentence} — ${loc}` : sentence;
  })();

  // Prefer url_original (raw photo, no letterboxing) with fallback chain
  const imageUrl = property.main_image?.url_original || property.main_image?.url_big || property.main_image?.url || '/placeholder-property.jpg';
  const fallbackUrl = property.main_image?.url_big || property.main_image?.url || '/placeholder-property.jpg';

  // Clean location display
  const location = (typeof property.location_label === 'string' ? property.location_label : '') ||
    [property.zone_label, property.city_label].filter(Boolean).join(', ');

  return (
    <Link href={`/propiedad/${property.id_property}`} className="block group">
      <div className="property-card bg-white dark:bg-card rounded-2xl overflow-hidden border border-black/[0.06] dark:border-border hover:border-gold/30 dark:hover:border-gold/30 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900 image-shine">
          <Image
            src={imageUrl}
            alt={cleanAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (img.src !== fallbackUrl) img.src = fallbackUrl;
            }}
          />
          {/* Gradient overlay — stronger at top and bottom for badge + price readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/30" />

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            <span className={`px-3 py-1.5 text-xs font-body font-bold rounded-full tracking-wide uppercase shadow-lg border ${
              businessType === 'Arriendo'
                ? 'bg-emerald-500 text-white border-emerald-400/30'
                : 'bg-[#3B6FA0] text-white border-[#4A8BC2]/30'
            }`} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {businessType}
            </span>
            {property.property_type_label && typeof property.property_type_label === 'string' && !property.property_type_label.includes('models/') && (
              <span className="px-3 py-1.5 bg-black/70 backdrop-blur-md text-white text-xs font-body font-medium rounded-full border border-white/10 shadow-lg">
                {property.property_type_label}
              </span>
            )}
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <p className="text-white text-xl font-display drop-shadow-lg">
              {price}
            </p>
            {businessType === 'Arriendo' && (
              <span className="text-white/70 text-xs font-body">/mes</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display text-base text-foreground mb-1 line-clamp-1 group-hover:text-gold transition-colors duration-300">
            {displayTitle}
          </h3>

          <p className="text-sm text-muted mb-3 flex items-center gap-1.5 line-clamp-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-gold/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {location}
          </p>

          {/* Specs row */}
          <div className="flex items-center gap-3 text-xs text-muted pt-3 border-t border-border/50">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4v16" /><path d="M2 8h18a2 2 0 012 2v10" /><path d="M2 17h20" /><path d="M6 8v9" />
                </svg>
                {property.bedrooms} hab
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1z" />
                  <path d="M6 12V5a2 2 0 012-2h3v2.25" />
                </svg>
                {property.bathrooms} baños
              </span>
            )}
            {property.area > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
                {property.area} m²
              </span>
            )}
            {property.garages > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10H6l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" /><path d="M14 17H10" /><circle cx="6.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /><path d="M6 10V5h12v5" />
                </svg>
                {property.garages}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default React.memo(PropertyCardInner, (prev, next) =>
  prev.property.id_property === next.property.id_property &&
  prev.property.main_image?.url_original === next.property.main_image?.url_original
);

