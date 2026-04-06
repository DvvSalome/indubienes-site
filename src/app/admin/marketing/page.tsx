'use client';
import { useState, useEffect, useRef } from 'react';

interface Property {
  id_property: number;
  title: string;
  sale_price: number;
  rent_price: number;
  sale_price_label?: string;
  rent_price_label?: string;
  for_sale?: boolean;
  for_rent?: boolean;
  main_image?: { url?: string; url_big?: string; url_original?: string };
}

interface LeadStats {
  bySource?: Record<string, number>;
}

export default function MarketingPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | ''>('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertySearch, setPropertySearch] = useState('');
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPropertyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProperties = async () => {
    try {
      setPropertiesLoading(true);
      // Use the search endpoint to get more properties with proper data
      const response = await fetch('/api/properties/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ take: 50, skip: 0 }),
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      const props = data.properties || [];
      setProperties(Array.isArray(props) ? props : []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Fallback: try /api/properties (highlighted)
      try {
        const res = await fetch('/api/properties');
        const data = await res.json();
        const props = data.properties || [];
        setProperties(Array.isArray(props) ? props : []);
      } catch {
        setProperties([]);
      }
    } finally {
      setPropertiesLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/leads?stats=true');
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyPrice = (prop: Property): string => {
    if (prop.for_sale && prop.sale_price_label) return prop.sale_price_label;
    if (prop.for_sale && prop.sale_price) return formatPrice(prop.sale_price);
    if (prop.rent_price_label) return prop.rent_price_label;
    if (prop.rent_price) return formatPrice(prop.rent_price);
    if (prop.sale_price) return formatPrice(prop.sale_price);
    return '';
  };

  const handleGenerateLink = () => {
    if (!selectedPropertyId) {
      alert('Por favor selecciona una propiedad');
      return;
    }
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://indubienes.com';
    let url = `${baseUrl}/p/${selectedPropertyId}`;
    if (utmSource) {
      url += `?utm_source=${encodeURIComponent(utmSource)}`;
      if (utmMedium) url += `&utm_medium=${encodeURIComponent(utmMedium)}`;
      if (utmCampaign) url += `&utm_campaign=${encodeURIComponent(utmCampaign)}`;
    }
    setGeneratedLink(url);
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const selectedProperty = properties.find(p => p.id_property === selectedPropertyId);
  const topProperties = properties
    .slice()
    .sort((a, b) => (b.sale_price || b.rent_price || 0) - (a.sale_price || a.rent_price || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Marketing</h1>
          <div className="h-1 w-16 bg-[#4A8BC2] rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-bold text-white">Generador de links</h2>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#888]">Selecciona una propiedad</label>
            {propertiesLoading ? (
              <div className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-[#555] animate-pulse">Cargando propiedades...</div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                {/* Search input */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    value={propertySearch}
                    onChange={(e) => { setPropertySearch(e.target.value); setShowPropertyDropdown(true); }}
                    onFocus={() => setShowPropertyDropdown(true)}
                    placeholder={selectedPropertyId ? properties.find(p => p.id_property === selectedPropertyId)?.title || 'Buscar propiedad...' : 'Buscar por nombre, tipo o zona...'}
                    className="w-full bg-[#222] border border-[#333] rounded-lg pl-10 pr-10 py-3 text-white placeholder:text-[#555] focus:outline-none focus:border-[#4A8BC2]/50 transition-colors"
                  />
                  {selectedPropertyId && (
                    <button
                      type="button"
                      onClick={() => { setSelectedPropertyId(''); setPropertySearch(''); setGeneratedLink(''); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>

                {/* Selected property chip */}
                {selectedPropertyId && !showPropertyDropdown && (
                  <div className="mt-2 flex items-center gap-2 bg-[#4A8BC2]/10 border border-[#4A8BC2]/30 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 text-[#4A8BC2] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-[#4A8BC2] truncate">{properties.find(p => p.id_property === selectedPropertyId)?.title}</span>
                  </div>
                )}

                {/* Dropdown list */}
                {showPropertyDropdown && (
                  <div className="absolute z-50 mt-1 w-full bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                    {(() => {
                      const searchLower = propertySearch.toLowerCase().trim();
                      const filtered = searchLower
                        ? properties.filter(p => p.title.toLowerCase().includes(searchLower))
                        : properties;

                      if (filtered.length === 0) {
                        return (
                          <div className="px-4 py-6 text-center">
                            <svg className="w-6 h-6 text-[#444] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-xs text-[#555]">No se encontraron propiedades</p>
                            <p className="text-[10px] text-[#444] mt-1">Intenta con otro término</p>
                          </div>
                        );
                      }

                      return (
                        <>
                          <div className="px-3 py-2 border-b border-[#222]">
                            <p className="text-[10px] text-[#555] uppercase tracking-wider">{filtered.length} propiedad{filtered.length !== 1 ? 'es' : ''}</p>
                          </div>
                          {filtered.map((prop) => {
                            const price = getPropertyPrice(prop);
                            const isSelected = prop.id_property === selectedPropertyId;
                            return (
                              <button
                                key={prop.id_property}
                                type="button"
                                onClick={() => {
                                  setSelectedPropertyId(prop.id_property);
                                  setPropertySearch('');
                                  setShowPropertyDropdown(false);
                                  setGeneratedLink('');
                                }}
                                className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors border-b border-[#222]/50 last:border-0 ${
                                  isSelected ? 'bg-[#4A8BC2]/10 text-[#4A8BC2]' : 'text-white hover:bg-[#222]'
                                }`}
                              >
                                {/* Thumbnail */}
                                <div className="w-10 h-10 rounded-lg bg-[#222] overflow-hidden shrink-0 border border-[#333]">
                                  {prop.main_image?.url ? (
                                    <img src={prop.main_image.url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <svg className="w-4 h-4 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{prop.title}</p>
                                  {price && <p className="text-[11px] text-[#888] mt-0.5">{price}</p>}
                                </div>
                                {isSelected && (
                                  <svg className="w-4 h-4 text-[#4A8BC2] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                )}
                              </button>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-[#222]">
            <h3 className="text-sm font-bold text-white">Parámetros UTM</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#888]">UTM Source</label>
              <input type="text" value={utmSource} onChange={(e) => setUtmSource(e.target.value)} placeholder="ej: facebook, google" className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2 text-white placeholder:text-[#555] focus:outline-none focus:border-[#4A8BC2]/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#888]">UTM Medium</label>
              <input type="text" value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} placeholder="ej: cpc, organic, email" className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2 text-white placeholder:text-[#555] focus:outline-none focus:border-[#4A8BC2]/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#888]">UTM Campaign</label>
              <input type="text" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} placeholder="ej: spring_sale" className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2 text-white placeholder:text-[#555] focus:outline-none focus:border-[#4A8BC2]/50 transition-colors" />
            </div>
          </div>

          <button onClick={handleGenerateLink} disabled={!selectedPropertyId} className="w-full bg-[#4A8BC2] hover:bg-[#D4B875] disabled:bg-[#555] disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-colors">Generar link</button>

          {generatedLink && (
            <div className="pt-4 border-t border-[#222] space-y-3">
              <p className="text-xs font-medium text-[#888]">Link generado:</p>
              <div className="bg-[#222] border border-[#333] rounded-lg p-3 flex items-center gap-2">
                <input type="text" value={generatedLink} readOnly className="flex-1 bg-transparent text-[#4A8BC2] text-xs font-mono outline-none" />
                <button onClick={handleCopyLink} className="px-3 py-1 bg-[#4A8BC2]/20 hover:bg-[#4A8BC2]/30 text-[#4A8BC2] rounded text-xs font-medium transition-colors">{copiedLink ? 'Copiado' : 'Copiar'}</button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">Vista previa</h2>
            {selectedProperty ? (
              <>
                <div className="bg-[#222] rounded-lg overflow-hidden border border-[#333]">
                  <div className="aspect-video bg-[#333] overflow-hidden flex items-center justify-center">
                    {(selectedProperty.main_image?.url_original || selectedProperty.main_image?.url_big || selectedProperty.main_image?.url) ? (
                      <img
                        src={selectedProperty.main_image.url_original || selectedProperty.main_image.url_big || selectedProperty.main_image.url}
                        alt={selectedProperty.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white line-clamp-2">{selectedProperty.title}</h3>
                    <p className="text-[#4A8BC2] font-bold mt-2">{getPropertyPrice(selectedProperty)}</p>
                    <p className="text-xs text-[#888] mt-1">indubienes.com</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#222]">
                  <p className="text-xs font-medium text-[#888] mb-3">Compartir en</p>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${selectedProperty.title}\n\n${getPropertyPrice(selectedProperty)}\n\n${generatedLink || `${typeof window !== 'undefined' ? window.location.origin : 'https://indubienes.com'}/p/${selectedProperty.id_property}`}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg py-2 text-green-300 text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      WhatsApp
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatedLink || `${typeof window !== 'undefined' ? window.location.origin : 'https://indubienes.com'}/p/${selectedProperty.id_property}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg py-2 text-blue-300 text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                      Facebook
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-[#444] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11v-5m0 0V9m0 5h.01" /></svg>
                <p className="text-[#888] text-sm">Selecciona una propiedad</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Leads por fuente</h2>
          {stats && stats.bySource && Object.keys(stats.bySource).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.bySource).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#4A8BC2]" />
                    <span className="text-sm text-[#888] capitalize">{source}</span>
                  </div>
                  <span className="font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-[#888] text-sm">Sin datos de leads aún</p>
              <p className="text-[#555] text-xs mt-1">Los leads del formulario de contacto aparecerán aquí</p>
            </div>
          )}
        </div>

        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Propiedades destacadas</h2>
          {topProperties.length > 0 ? (
            <div className="space-y-3">
              {topProperties.map((prop) => (
                <div key={prop.id_property} className="flex items-center justify-between p-3 bg-[#222] rounded-lg">
                  <span className="text-sm text-[#888] line-clamp-1 flex-1 mr-3">{prop.title}</span>
                  <span className="text-[#4A8BC2] font-bold text-sm whitespace-nowrap">{getPropertyPrice(prop)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#888] text-sm">Sin propiedades</p>
          )}
        </div>
      </div>
    </div>
  );
}
