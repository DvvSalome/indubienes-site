'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import CustomSelect from '@/components/CustomSelect';
import { Property, PropertyType } from '@/lib/types';
import gsap from 'gsap';

const PAGE_SIZE = 12;

interface Props {
  initialProperties: Property[];
  total: number;
  propertyTypes: PropertyType[];
  currentPage: number;
  searchParams: Record<string, string | undefined>;
}

export default function PropertiesClient({
  initialProperties,
  total,
  propertyTypes,
  searchParams: sp,
}: Props) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [tipo, setTipo] = useState(sp.tipo || '');
  const [propiedad, setPropiedad] = useState(sp.propiedad || '');
  const [minPrecio, setMinPrecio] = useState(sp.minPrecio || '');
  const [maxPrecio, setMaxPrecio] = useState(sp.maxPrecio || '');
  const [habitaciones, setHabitaciones] = useState(sp.habitaciones || '');
  const [banos, setBanos] = useState(sp.banos || '');

  // Load-more state
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const [prefetchedBatch, setPrefetchedBatch] = useState<Property[] | null>(null);
  const prefetchingRef = useRef(false);
  const newCardsCountRef = useRef(0);

  // Reset when SSR props change (e.g. filter navigation)
  useEffect(() => {
    setProperties(initialProperties);
    setPrefetchedBatch(null);
    prefetchingRef.current = false;
    newCardsCountRef.current = initialProperties.length;
  }, [initialProperties]);

  const hasMore = properties.length < total;

  const buildFilters = useCallback(
    (skip: number) => {
      const filters: Record<string, unknown> = { skip, take: PAGE_SIZE };
      if (sp.tipo === 'venta') filters.for_sale = true;
      if (sp.tipo === 'arriendo') filters.for_rent = true;
      if (sp.propiedad) filters.id_property_type = parseInt(sp.propiedad, 10);
      if (sp.zona) filters.id_zone = parseInt(sp.zona, 10);
      if (sp.minPrecio) filters.min_price = parseInt(sp.minPrecio, 10);
      if (sp.maxPrecio) filters.max_price = parseInt(sp.maxPrecio, 10);
      if (sp.habitaciones) filters.min_bedrooms = parseInt(sp.habitaciones, 10);
      if (sp.banos) filters.bathrooms = parseInt(sp.banos, 10);
      return filters;
    },
    [sp]
  );

  // Fetch next batch from /api/properties/search
  const fetchNextBatch = useCallback(
    async (skip: number): Promise<Property[]> => {
      const res = await fetch('/api/properties/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildFilters(skip)),
      });
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      return (data?.properties ?? []) as Property[];
    },
    [buildFilters]
  );

  // Prefetch in background — triggers on hover (desktop) or scroll threshold (mobile)
  const prefetchMore = useCallback(async () => {
    if (!hasMore || loading || prefetchingRef.current || prefetchedBatch) return;
    prefetchingRef.current = true;
    try {
      const batch = await fetchNextBatch(properties.length);
      setPrefetchedBatch(batch);
    } catch {
      // silent fail; real click will retry
    } finally {
      prefetchingRef.current = false;
    }
  }, [hasMore, loading, prefetchedBatch, properties.length, fetchNextBatch]);

  // Actual "Cargar más" click
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const batch = prefetchedBatch ?? (await fetchNextBatch(properties.length));
      newCardsCountRef.current = batch.length;
      setProperties((prev) => [...prev, ...batch]);
      setPrefetchedBatch(null);
    } catch (err) {
      console.error('loadMore failed', err);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, prefetchedBatch, properties.length, fetchNextBatch]);

  // IntersectionObserver sentinel — prefetch when user scrolls near button
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) prefetchMore();
      },
      { rootMargin: '400px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, prefetchMore]);

  // Animate cards — initial load animates all; subsequent loads animate only new ones
  useEffect(() => {
    if (!gridRef.current) return;
    const allCards = gridRef.current.querySelectorAll('.prop-card-anim');
    if (!allCards.length) return;

    const isInitial = properties.length === initialProperties.length;
    const cards = isInitial
      ? Array.from(allCards)
      : Array.from(allCards).slice(-newCardsCountRef.current);

    if (!cards.length) return;
    gsap.set(cards, { y: 24, opacity: 0 });
    requestAnimationFrame(() => {
      gsap.to(cards, {
        y: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.05,
        ease: 'power2.out',
      });
    });
  }, [properties.length, initialProperties.length]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (tipo) params.set('tipo', tipo);
    if (propiedad) params.set('propiedad', propiedad);
    if (minPrecio) params.set('minPrecio', minPrecio);
    if (maxPrecio) params.set('maxPrecio', maxPrecio);
    if (habitaciones) params.set('habitaciones', habitaciones);
    if (banos) params.set('banos', banos);
    router.push(`/propiedades?${params.toString()}`);
  };

  const clearFilters = () => {
    setTipo('');
    setPropiedad('');
    setMinPrecio('');
    setMaxPrecio('');
    setHabitaciones('');
    setBanos('');
    router.push('/propiedades');
  };

  const hasActiveFilters = tipo || propiedad || minPrecio || maxPrecio || habitaciones || banos;

  // Build options
  const tipoOptions = [
    { value: '', label: 'Todos' },
    { value: 'venta', label: 'Venta' },
    { value: 'arriendo', label: 'Arriendo' },
  ];

  const propiedadOptions = [
    { value: '', label: 'Todos los tipos' },
    ...propertyTypes
      .filter(
        (pt) =>
          pt?.id_property_type &&
          pt.name &&
          !pt.name.startsWith('models/') &&
          !pt.name.includes('.id.')
      )
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 15)
      .map((pt) => ({
        value: String(pt.id_property_type),
        label: `${pt.name}${pt.count ? ` (${pt.count})` : ''}`,
      })),
  ];

  const habitacionesOptions = [
    { value: '', label: 'Cualquiera' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' },
  ];

  const banosOptions = [
    { value: '', label: 'Cualquiera' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {/* Premium filter bar */}
      <div className="mb-10 relative z-40">
        {/* Mobile toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full flex items-center justify-between gap-2 px-5 py-3.5 bg-card border border-border rounded-xl text-sm font-body text-foreground mb-4 transition-all duration-300 hover:border-gold/30"
        >
          <span className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span className="tracking-wide">Filtros</span>
            {hasActiveFilters && (
              <span className="bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Activos</span>
            )}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Filter grid */}
        <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <CustomSelect label="Negocio" options={tipoOptions} value={tipo} onChange={setTipo} variant="filter" />
              <CustomSelect label="Propiedad" options={propiedadOptions} value={propiedad} onChange={setPropiedad} variant="filter" />
              <CustomSelect label="Habitaciones" options={habitacionesOptions} value={habitaciones} onChange={setHabitaciones} variant="filter" />
              <CustomSelect label="Baños" options={banosOptions} value={banos} onChange={setBanos} variant="filter" />

              <div>
                <label className="block text-xs font-body text-muted mb-1.5 tracking-wide">Precio mín.</label>
                <input
                  type="number"
                  value={minPrecio}
                  onChange={(e) => setMinPrecio(e.target.value)}
                  placeholder="$ Mínimo"
                  className="w-full bg-surface border border-border text-foreground rounded-xl px-4 py-2.5 text-sm font-body placeholder:text-faint/50 transition-all duration-300 hover:border-gold/30 focus:border-gold/60 focus:shadow-[0_0_0_2px_rgba(201,169,98,0.15)]"
                />
              </div>
              <div>
                <label className="block text-xs font-body text-muted mb-1.5 tracking-wide">Precio máx.</label>
                <input
                  type="number"
                  value={maxPrecio}
                  onChange={(e) => setMaxPrecio(e.target.value)}
                  placeholder="$ Máximo"
                  className="w-full bg-surface border border-border text-foreground rounded-xl px-4 py-2.5 text-sm font-body placeholder:text-faint/50 transition-all duration-300 hover:border-gold/30 focus:border-gold/60 focus:shadow-[0_0_0_2px_rgba(201,169,98,0.15)]"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-border/30">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 text-sm font-body text-muted hover:text-gold transition-all duration-300 tracking-wide"
                >
                  Limpiar
                </button>
              )}
              <button
                onClick={applyFilters}
                className="group px-8 py-2.5 bg-gold hover:bg-gold-hover text-white font-body font-semibold text-sm rounded-xl transition-all duration-300 tracking-wide flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:scale-110">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Properties grid */}
      <div ref={gridRef}>
        {properties.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="text-xl font-display text-foreground mb-2">No se encontraron propiedades</h3>
            <p className="text-muted font-body mb-8 max-w-md mx-auto">Intente ajustar los filtros de búsqueda para encontrar más opciones</p>
            <button
              onClick={clearFilters}
              className="px-8 py-3 bg-gold hover:bg-gold-hover text-white font-body font-semibold text-sm rounded-xl transition-all duration-300"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property, i) => (
                <div
                  key={`${property.id_property}-${i}`}
                  className="prop-card-anim"
                >
                  <PropertyCard property={property} />
                </div>
              ))}

              {/* Skeleton placeholders while loading */}
              {loading &&
                Array.from({ length: Math.min(PAGE_SIZE, total - properties.length) }).map(
                  (_, i) => <SkeletonCard key={`skeleton-${i}`} />
                )}
            </div>

            {/* Scroll sentinel — triggers prefetch ~400px before button */}
            <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

            {/* Load more section */}
            <div className="mt-14 flex flex-col items-center gap-4">
              {hasMore ? (
                <>
                  <button
                    onClick={loadMore}
                    onMouseEnter={prefetchMore}
                    onFocus={prefetchMore}
                    disabled={loading}
                    className="group relative w-full max-w-xs min-h-[56px] px-8 py-4 bg-gold hover:bg-gold-hover disabled:opacity-70 disabled:cursor-wait text-white font-body font-semibold text-sm sm:text-base rounded-2xl transition-all duration-300 tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-gold/15 hover:shadow-xl hover:shadow-gold/25 hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <span>Cargando…</span>
                      </>
                    ) : (
                      <>
                        <span>Cargar más propiedades</span>
                        <svg
                          className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                  <p className="text-xs sm:text-sm font-body text-muted tracking-wide">
                    Mostrando <span className="text-foreground font-semibold">{properties.length}</span> de{' '}
                    <span className="text-foreground font-semibold">{total}</span> propiedades
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-body text-muted tracking-wide">
                    <span className="block w-8 h-[1px] bg-gold/40" aria-hidden="true" />
                    Has visto todas las {total} propiedades
                    <span className="block w-8 h-[1px] bg-gold/40" aria-hidden="true" />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Skeleton Card ----------------------------- */
function SkeletonCard() {
  return (
    <div className="bg-card/50 border border-border/40 rounded-2xl overflow-hidden">
      <div className="aspect-[4/3] bg-surface animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-surface rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-surface rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-surface rounded animate-pulse" />
        <div className="pt-3 mt-3 border-t border-border/40 flex gap-3">
          <div className="h-3 w-12 bg-surface rounded animate-pulse" />
          <div className="h-3 w-12 bg-surface rounded animate-pulse" />
          <div className="h-3 w-12 bg-surface rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
