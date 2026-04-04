import Link from 'next/link';
import { Property } from '@/lib/types';
import { formatPrice } from '@/lib/wasi';

export default function PropertyCard({ property }: { property: Property }) {
  const price = property.for_sale && property.sale_price
    ? property.sale_price_label || formatPrice(property.sale_price)
    : property.rent_price_label || formatPrice(property.rent_price);

  const businessType = property.for_sale ? 'Venta' : 'Arriendo';

  // Prefer url_big for better quality and no padding
  const imageUrl = property.main_image?.url_big || property.main_image?.url_original || property.main_image?.url || '/placeholder-property.jpg';

  return (
    <Link href={`/propiedad/${property.id_property}`} className="block group">
      <div className="property-card bg-card rounded-xl overflow-hidden border border-border">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          <img
            src={imageUrl}
            alt={property.title || ''}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 image-overlay opacity-60" />

          {/* Badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-3 py-1 bg-gold text-[#0D0D0D] text-xs font-body font-semibold rounded-full tracking-wide uppercase">
              {businessType}
            </span>
            {property.property_type_label && typeof property.property_type_label === 'string' && (
              <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-body rounded-full">
                {property.property_type_label}
              </span>
            )}
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-3 left-3">
            <p className="text-white text-xl font-display font-normal">
              {price}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display text-lg text-foreground mb-1 line-clamp-1 group-hover:text-gold transition-colors">
            {property.title}
          </h3>

          <p className="text-sm text-muted mb-3 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {(typeof property.location_label === 'string' ? property.location_label : '') ||
             `${typeof property.zone_label === 'string' ? property.zone_label : ''}, ${typeof property.city_label === 'string' ? property.city_label : ''}`}
          </p>

          {/* Specs */}
          <div className="flex items-center gap-4 text-sm text-muted">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7" />
                  <path d="M21 10H3V7a2 2 0 012-2h14a2 2 0 012 2v3z" />
                  <path d="M7 10V7" />
                  <path d="M17 10V7" />
                </svg>
                {property.bedrooms}
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1z" />
                  <path d="M6 12V5a2 2 0 012-2h3v2.25" />
                </svg>
                {property.bathrooms}
              </span>
            )}
            {property.area > 0 && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                {property.area} m²
              </span>
            )}
            {property.garages > 0 && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21V8l9-5 9 5v13" />
                  <path d="M3 21h18" />
                  <path d="M9 21v-6h6v6" />
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
