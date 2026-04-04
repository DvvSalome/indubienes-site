'use client';
import { useState, useEffect } from 'react';

interface Property {
  id: number;
  title: string;
  price: number;
  image_url?: string;
  sale_rent: 'sale' | 'rent';
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

  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
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

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const topProperties = properties.slice().sort((a, b) => b.price - a.price).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Marketing</h1>
          <div className="h-1 w-16 bg-[#C9A962] rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-bold text-white">Generador de links</h2>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#888]">Selecciona una propiedad</label>
            <select value={selectedPropertyId} onChange={(e) => { setSelectedPropertyId(e.target.value ? Number(e.target.value) : ''); setGeneratedLink(''); }} className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C9A962]/50 transition-colors cursor-pointer">
              <option value="">-- Selecciona una propiedad --</option>
              {properties.map((prop) => <option key={prop.id} value={prop.id}>{prop.title}</option>)}
            </select>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#222]">
            <h3 className="text-sm font-bold text-white">Parámetros UTM</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#888]">UTM Source</label>
              <input type="text" value={utmSource} onChange={(e) => setUtmSource(e.target.value)} placeholder="ej: facebook, google" className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2 text-white placeholder:text-[#555] focus:outline-none focus:border-[#C9A962]/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#888]">UTM Medium</label>
              <input type="text" value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} placeholder="ej: cpc, organic, email" className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2 text-white placeholder:text-[#555] focus:outline-none focus:border-[#C9A962]/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#888]">UTM Campaign</label>
              <input type="text" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} placeholder="ej: spring_sale" className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2 text-white placeholder:text-[#555] focus:outline-none focus:border-[#C9A962]/50 transition-colors" />
            </div>
          </div>

          <button onClick={handleGenerateLink} disabled={!selectedPropertyId} className="w-full bg-[#C9A962] hover:bg-[#D4B875] disabled:bg-[#555] disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-colors">Generar link</button>

          {generatedLink && (
            <div className="pt-4 border-t border-[#222] space-y-3">
              <p className="text-xs font-medium text-[#888]">Link generado:</p>
              <div className="bg-[#222] border border-[#333] rounded-lg p-3 flex items-center gap-2">
                <input type="text" value={generatedLink} readOnly className="flex-1 bg-transparent text-[#C9A962] text-xs font-mono outline-none" />
                <button onClick={handleCopyLink} className="px-3 py-1 bg-[#C9A962]/20 hover:bg-[#C9A962]/30 text-[#C9A962] rounded text-xs font-medium transition-colors">{copiedLink ? 'Copiado' : 'Copiar'}</button>
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
                    {selectedProperty.image_url ? <img src={selectedProperty.image_url} alt={selectedProperty.title} className="w-full h-full object-cover" /> : <svg className="w-8 h-8 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white line-clamp-2">{selectedProperty.title}</h3>
                    <p className="text-[#C9A962] font-bold mt-2">${selectedProperty.price.toLocaleString('es-CO')}</p>
                    <p className="text-xs text-[#888] mt-1">indubienes.com</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#222]">
                  <p className="text-xs font-medium text-[#888] mb-3">Compartir en</p>
                  <div className="grid grid-cols-2 gap-3">
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${selectedProperty.title}\n\n$${selectedProperty.price.toLocaleString('es-CO')}\n\n${generatedLink || 'https://indubienes.com'}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg py-2 text-green-300 text-sm font-medium transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371 0-.57 0-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.732 5.41 2.115 7.737L3.329 23.994l8.23-2.161c2.261 1.23 4.787 1.878 7.465 1.878 5.37 0 9.957-4.587 9.957-10.007 0-2.679-.551-5.212-1.589-7.663-1.038-2.451-2.506-4.617-4.383-6.36-1.877-1.743-4.061-3.085-6.499-3.973C13.322.75 10.557 0 7.589 0 2.218 0-2.242 4.587-2.242 10.007c0 1.71.35 3.34 1.007 4.828L.292 23.994l8.23-2.161c2.261 1.23 4.787 1.878 7.465 1.878 5.37 0 9.957-4.587 9.957-10.007 0-2.679-.551-5.212-1.589-7.663-1.038-2.451-2.506-4.617-4.383-6.36-1.877-1.743-4.061-3.085-6.499-3.973C13.322.75 10.557 0 7.589 0 2.218 0-2.242 4.587-2.242 10.007z" /></svg>
                      WhatsApp
                    </a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatedLink || 'https://indubienes.com')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg py-2 text-blue-300 text-sm font-medium transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                      Facebook
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8"><svg className="w-12 h-12 text-[#444] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11v-5m0 0V9m0 5h.01" /></svg><p className="text-[#888] text-sm">Selecciona una propiedad</p></div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Leads por fuente</h2>
          {stats && stats.bySource ? (
            <div className="space-y-3">
              {Object.entries(stats.bySource).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#C9A962]" />
                    <span className="text-sm text-[#888] capitalize">{source}</span>
                  </div>
                  <span className="font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#888] text-sm">Sin datos</p>
          )}
        </div>

        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Propiedades destacadas</h2>
          {topProperties.length > 0 ? (
            <div className="space-y-3">
              {topProperties.map((prop) => (
                <div key={prop.id} className="flex items-center justify-between p-3 bg-[#222] rounded-lg">
                  <span className="text-sm text-[#888] line-clamp-1">{prop.title}</span>
                  <span className="text-[#C9A962] font-bold text-sm">${(prop.price / 1000000).toFixed(1)}M</span>
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
