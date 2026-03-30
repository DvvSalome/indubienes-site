'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import { Property, PropertyType } from '@/lib/types';

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

  const [tipo, setTipo] = useState(sp.tipo || '');
  const [propiedad, setPropiedad] = useState(sp.propiedad || '');
  const [minPrecio, setMinPrecio] = useState(sp.minPrecio || '');
  const [maxPrecio, setMaxPrecio] = useState(sp.maxPrecio || '');
  const [habitaciones, setHabitaciones] = useState(sp.habitaciones || '');
  const [banos, setBanos] = useState(sp.banos || '');

  const totalPages = Math.ceil(total / 12);

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

  const selectClass = "w-full bg-card text-foreground border border-border rounded-lg px-4 py-2.5 text-sm font-body focus:border-gold appearance-none cursor-pointer";
  const inputClass = "w-full bg-card text-foreground border border-border rounded-lg px-4 py-2.5 text-sm font-body placeholder:text-faint";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter toggle (mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-body text-foreground"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>

        {/* Sidebar filters */}
        <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-card border border-border rounded-xl p-6 sticky top-28">
            <h3 className="font-display text-lg text-foreground mb-6">Filtros</h3>

            <div className="space-y-5">
              {/* Tipo de negocio */}
              <div>
                <label className="block text-sm font-body text-muted mb-2">Tipo de negocio</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={selectClass}>
                  <option value="">Todos</option>
                  <option value="venta">Venta</option>
                  <option value="arriendo">Arriendo</option>
                </select>
              </div>

              {/* Tipo de propiedad */}
              <div>
                <label className="block text-sm font-body text-muted mb-2">Tipo de propiedad</label>
                <select value={propiedad} onChange={(e) => setPropiedad(e.target.value)} className={selectClass}>
                  <option value="">Todos</option>
                  {propertyTypes.map((pt) => (
                    <option key={pt.id_property_type} value={pt.id_property_type.toString()}>
                      {pt.name} ({pt.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-body text-muted mb-2">Precio mínimo</label>
                <input
                  type="number"
                  value={minPrecio}
                  onChange={(e) => setMinPrecio(e.target.value)}
                  placeholder="Ej: 200000000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-body text-muted mb-2">Precio máximo</label>
                <input
                  type="number"
                  value={maxPrecio}
                  onChange={(e) => setMaxPrecio(e.target.value)}
                  placeholder="Ej: 800000000"
                  className={inputClass}
                />
              </div>

              {/* Habitaciones */}
              <div>
                <label className="block text-sm font-body text-muted mb-2">Habitaciones mín.</label>
                <select value={habitaciones} onChange={(e) => setHabitaciones(e.target.value)} className={selectClass}>
                  <option value="">Cualquiera</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              {/* Baños */}
              <div>
                <label className="block text-sm font-body text-muted mb-2">Baños mín.</label>
                <select value={banos} onChange={(e) => setBanos(e.target.value)} className={selectClass}>
                  <option value="">Cualquiera</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 py-2.5 bg-gold hover:bg-gold-hover text-[#0D0D0D] font-body font-semibold text-sm rounded-lg transition-colors"
                >
                  Aplicar
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 border border-border text-muted hover:text-foreground font-body text-sm rounded-lg transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Properties grid */}
        <div className="flex-1">
          {initialProperties.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-faint mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 10H3V7a2 2 0 012-2h14a2 2 0 012 2v3z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="text-xl font-display text-foreground mb-2">No se encontraron propiedades</h3>
              <p className="text-muted font-body mb-6">Intente ajustar los filtros de búsqueda</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-gold hover:bg-gold-hover text-[#0D0D0D] font-body font-semibold text-sm rounded-lg transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {initialProperties.map((property) => (
                  <PropertyCard key={property.id_property} property={property} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-2 text-sm font-body text-muted hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                          className={`w-10 h-10 rounded-lg text-sm font-body transition-colors ${
                            p === currentPage
                              ? 'bg-gold text-[#0D0D0D] font-semibold'
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
                    className="px-3 py-2 text-sm font-body text-muted hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
