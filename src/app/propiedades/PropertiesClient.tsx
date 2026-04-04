'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import CustomSelect from '@/components/CustomSelect';
import { Property, PropertyType } from '@/lib/types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
  currentPage,
  searchParams: sp,
}: Props) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const [tipo, setTipo] = useState(sp.tipo || '');
  const [propiedad, setPropiedad] = useState(sp.propiedad || '');
  const [minPrecio, setMinPrecio] = useState(sp.minPrecio || '');
  const [maxPrecio, setMaxPrecio] = useState(sp.maxPrecio || '');
  const [habitaciones, setHabitaciones] = useState(sp.habitaciones || '');
  const [banos, setBanos] = useState(sp.banos || '');

  const totalPages = Math.ceil(total / 12);

  // Animate cards on mount
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.prop-card-anim');
    if (!cards.length) return;

    gsap.fromTo(cards, {
      y: 60,
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out',
    });
  }, [initialProperties]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (tipo) params.set('tipo', tipo);
    if (propiedad) params.set('propiedad', propiedad);
    if (minPrecio) params.set('minPrecio', minPrecio);
    if (maxPrecio) params.set('maxPrecio', maxPrecio);
    if (habitaciones) params.set('habitaciones', habitaciones);
    if (banos) params.set('banos', banos);
    params.set('page', '1');
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

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    if (tipo) params.set('tipo', tipo);
    if (propiedad) params.set('propiedad', propiedad);
    if (minPrecio) params.set('minPrecio', minPrecio);
    if (maxPrecio) params.set('maxPrecio', maxPrecio);
    if (habitaciones) params.set('habitaciones', habitaciones);
    if (banos) params.set('banos', banos);
    params.set('page', page.toString());
    router.push(`/propiedades?${params.toString()}`);
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
      .filter(pt => pt?.id_property_type)
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .map(pt => ({
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
      <div className="mb-10">
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
              <span className="bg-gold text-[#0D0D0D] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Activos</span>
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

              {/* Price inputs with luxury styling */}
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
                className="group px-8 py-2.5 bg-gold hover:bg-gold-hover text-[#0D0D0D] font-body font-semibold text-sm rounded-xl transition-all duration-300 tracking-wide flex items-center gap-2"
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
        {initialProperties.length === 0 ? (
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
              className="px-8 py-3 bg-gold hover:bg-gold-hover text-[#0D0D0D] font-body font-semibold text-sm rounded-xl transition-all duration-300"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {initialProperties.map((property) => (
                <div key={property.id_property} className="prop-card-anim">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-14">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2.5 text-sm font-body text-muted hover:text-gold disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 rounded-xl hover:bg-surface"
                >
                  ← Anterior
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-faint">...</span>
                      )}
                      <button
                        onClick={() => goToPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-body transition-all duration-300 ${
                          p === currentPage
                            ? 'bg-gold text-[#0D0D0D] font-semibold shadow-lg shadow-gold/20'
                            : 'text-muted hover:text-gold hover:bg-surface'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2.5 text-sm font-body text-muted hover:text-gold disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 rounded-xl hover:bg-surface"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
