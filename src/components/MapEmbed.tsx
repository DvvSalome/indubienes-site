'use client';

/**
 * Unified Google Maps satellite embed component.
 *
 * Replaces duplicate iframe maps across:
 *   - /contacto (static office location)
 *   - /propiedad/[id] (dynamic property location)
 *   - /p/[id] (funnel property location)
 */

interface MapEmbedProps {
  /** Latitude (e.g. 6.2442 for Medellín) */
  latitude: number;
  /** Longitude (e.g. -75.5866 for Medellín) */
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

export default function MapEmbed({
  latitude,
  longitude,
  zoom = 17,
  title = 'Ubicación en el mapa',
  className = 'aspect-[16/9]',
  heading,
}: MapEmbedProps) {
  // Google Maps embed — hybrid satellite view (t=h), no API key needed
  const src = `https://maps.google.com/maps?q=${latitude},${longitude}&t=h&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div>
      {heading && (
        <h2 className="text-xl font-display font-bold text-foreground mb-4">{heading}</h2>
      )}
      <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
        <iframe
          src={src}
          className="w-full h-full"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
        />
      </div>
    </div>
  );
}
