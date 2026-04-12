'use client';

/**
 * Unified OpenStreetMap embed component.
 *
 * Replaces duplicate iframe maps across:
 *   - /contacto (static office location)
 *   - /propiedad/[id] (dynamic property location)
 *   - /p/[id] (funnel property location)
 *
 * @see ADR-0002 for media pipeline decisions
 */

interface MapEmbedProps {
  /** Latitude (e.g. 6.2442 for Medellín) */
  latitude: number;
  /** Longitude (e.g. -75.5866 for Medellín) */
  longitude: number;
  /** Controls zoom — smaller = closer. Default 0.008 */
  bboxPadding?: { lat: number; lng: number };
  /** Accessible title for the iframe */
  title?: string;
  /** Extra Tailwind classes for the outer container */
  className?: string;
  /** Show a heading above the map */
  heading?: string;
}

/** Indubienes office — Carrera 77 #36-31, Laureles, Medellín */
export const OFFICE_COORDS = { lat: 6.2442, lng: -75.5866 } as const;

export default function MapEmbed({
  latitude,
  longitude,
  bboxPadding = { lat: 0.005, lng: 0.01 },
  title = 'Ubicación en el mapa',
  className = 'aspect-[16/9]',
  heading,
}: MapEmbedProps) {
  const bbox = [
    longitude - bboxPadding.lng,
    latitude - bboxPadding.lat,
    longitude + bboxPadding.lng,
    latitude + bboxPadding.lat,
  ].join(',');

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;

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
          title={title}
        />
      </div>
    </div>
  );
}
