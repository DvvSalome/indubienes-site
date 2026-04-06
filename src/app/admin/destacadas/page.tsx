'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface PropertyItem {
  id_property: number;
  title: string;
  sale_price: number;
  rent_price: number;
  city_label: string;
  zone_label: string;
  property_type_label: string;
  main_image?: { url?: string; url_big?: string };
  for_sale: boolean;
  for_rent: boolean;
}

interface FeaturedConfig {
  ids: number[];
  updatedAt: string;
  updatedBy: string;
}

function formatCOP(price: number): string {
  if (!price) return '';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
}

function toTitleCase(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/(?:^|\s|["'([{-])\S/g, m => m.toUpperCase());
}

export default function AdminDestacadas() {
  const [allProperties, setAllProperties] = useState<PropertyItem[]>([]);
  const [featuredIds, setFeaturedIds] = useState<number[]>([]);
  const [originalIds, setOriginalIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  // Load featured config + all properties
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Load featured config
        const featRes = await fetch('/api/featured');
        if (featRes.ok) {
          const config: FeaturedConfig = await featRes.json();
          setFeaturedIds(config.ids || []);
          setOriginalIds(config.ids || []);
          if (config.updatedAt) {
            setLastUpdate(new Date(config.updatedAt).toLocaleString('es-CO'));
          }
        }

        // Load all properties from WASI (up to 100)
        const propsRes = await fetch('/api/properties/all');
        if (propsRes.ok) {
          const data = await propsRes.json();
          setAllProperties(data.properties || []);
        }
      } catch (err) {
        console.error('Load error:', err);
      }
      setLoading(false);
    }
    load();
  }, []);

  const toggleFeatured = useCallback((id: number) => {
    setFeaturedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(fid => fid !== id);
      }
      if (prev.length >= 9) {
        alert('Máximo 9 propiedades destacadas');
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const moveFeatured = useCallback((id: number, direction: 'up' | 'down') => {
    setFeaturedIds(prev => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const newArr = [...prev];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= newArr.length) return prev;
      [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];
      return newArr;
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: featuredIds, updatedBy: 'admin' }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg(data.message || 'Guardado exitosamente');
        setOriginalIds([...featuredIds]);
        setLastUpdate(new Date().toLocaleString('es-CO'));
      } else {
        setSaveMsg('Error: ' + (data.error || 'No se pudo guardar'));
      }
    } catch {
      setSaveMsg('Error de conexión');
    }
    setSaving(false);
  };

  const hasChanges = JSON.stringify(featuredIds) !== JSON.stringify(originalIds);

  // Filter & paginate
  const filtered = allProperties.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.city_label?.toLowerCase().includes(q) ||
      p.zone_label?.toLowerCase().includes(q) ||
      p.property_type_label?.toLowerCase().includes(q) ||
      String(p.id_property).includes(q)
    );
  });

  // Sort: featured first, then by ID desc
  const sorted = [...filtered].sort((a, b) => {
    const aFeat = featuredIds.includes(a.id_property) ? 0 : 1;
    const bFeat = featuredIds.includes(b.id_property) ? 0 : 1;
    if (aFeat !== bFeat) return aFeat - bFeat;
    return b.id_property - a.id_property;
  });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Featured properties in order
  const featuredProperties = featuredIds
    .map(id => allProperties.find(p => p.id_property === id))
    .filter((p): p is PropertyItem => p !== undefined);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Propiedades Destacadas</h1>
          <p className="text-sm text-gray-400 mt-1">
            Elige cuáles propiedades aparecen en el home. Máximo 9.
            {lastUpdate && <span className="text-gray-500"> · Última actualización: {lastUpdate}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors">
            ← Panel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              hasChanges
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" /></svg>
                Guardando...
              </span>
            ) : (
              `Guardar (${featuredIds.length})`
            )}
          </button>
        </div>
      </div>

      {/* Save message */}
      {saveMsg && (
        <div className={`px-4 py-3 rounded-lg text-sm ${saveMsg.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
          {saveMsg}
        </div>
      )}

      {/* Current featured order */}
      {featuredProperties.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            Orden actual ({featuredProperties.length}/9)
          </h3>
          <div className="flex flex-wrap gap-2">
            {featuredProperties.map((p, idx) => (
              <div key={p.id_property} className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5 text-xs">
                <span className="text-blue-400 font-bold">{idx + 1}.</span>
                <span className="text-gray-300 max-w-[200px] truncate">{toTitleCase(p.title)}</span>
                <button onClick={() => moveFeatured(p.id_property, 'up')} disabled={idx === 0} className="text-gray-500 hover:text-white disabled:opacity-30 ml-1">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
                </button>
                <button onClick={() => moveFeatured(p.id_property, 'down')} disabled={idx === featuredProperties.length - 1} className="text-gray-500 hover:text-white disabled:opacity-30">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                <button onClick={() => toggleFeatured(p.id_property)} className="text-gray-500 hover:text-red-400 ml-0.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          type="text"
          placeholder="Buscar por nombre, ciudad, zona o ID..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Properties grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="w-8 h-8 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" /></svg>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((p) => {
              const isFeatured = featuredIds.includes(p.id_property);
              const imgUrl = p.main_image?.url_big || p.main_image?.url || '';
              const price = p.for_sale ? formatCOP(p.sale_price) : formatCOP(p.rent_price);
              const tipo = p.for_sale ? 'Venta' : 'Arriendo';

              return (
                <div
                  key={p.id_property}
                  onClick={() => toggleFeatured(p.id_property)}
                  className={`relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    isFeatured
                      ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-[16/10] bg-gray-900 relative">
                    {imgUrl ? (
                      <img src={imgUrl} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      </div>
                    )}

                    {/* Featured badge */}
                    {isFeatured && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        #{featuredIds.indexOf(p.id_property) + 1}
                      </div>
                    )}

                    {/* Type badge */}
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                      {tipo}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-white text-sm font-semibold truncate">{toTitleCase(p.title)}</p>
                    <p className="text-gray-400 text-xs mt-1 truncate">
                      {p.property_type_label} · {p.zone_label || p.city_label} · ID {p.id_property}
                    </p>
                    <p className="text-blue-400 text-sm font-bold mt-1.5">{price}</p>
                  </div>

                  {/* Check overlay */}
                  <div className={`absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center transition-opacity pointer-events-none ${isFeatured ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {paginated.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {search ? 'No se encontraron propiedades para esa búsqueda' : 'No hay propiedades disponibles'}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm text-gray-400 border border-gray-700 rounded-lg hover:text-white disabled:opacity-30"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-500">
                Página {page} de {totalPages} · {sorted.length} propiedades
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm text-gray-400 border border-gray-700 rounded-lg hover:text-white disabled:opacity-30"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
