'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSearch() {
  const router = useRouter();
  const [tipoNegocio, setTipoNegocio] = useState('venta');
  const [tipoPropiedad, setTipoPropiedad] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (tipoNegocio) params.set('tipo', tipoNegocio);
    if (tipoPropiedad) params.set('propiedad', tipoPropiedad);
    router.push(`/propiedades?${params.toString()}`);
  };

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-3 sm:p-4 max-w-3xl mx-auto border border-white/10">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Tipo de negocio */}
          <div className="flex-1">
            <select
              value={tipoNegocio}
              onChange={(e) => setTipoNegocio(e.target.value)}
              className="w-full bg-white/10 text-white border border-white/10 rounded-lg px-4 py-3 text-sm font-body focus:border-gold appearance-none cursor-pointer"
            >
              <option value="venta" className="bg-[#1A1A1A] text-white">Venta</option>
              <option value="arriendo" className="bg-[#1A1A1A] text-white">Arriendo</option>
            </select>
          </div>

          {/* Tipo de propiedad */}
          <div className="flex-1">
            <select
              value={tipoPropiedad}
              onChange={(e) => setTipoPropiedad(e.target.value)}
              className="w-full bg-white/10 text-white border border-white/10 rounded-lg px-4 py-3 text-sm font-body focus:border-gold appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1A1A1A] text-white">Tipo de propiedad</option>
              <option value="2" className="bg-[#1A1A1A] text-white">Apartamento</option>
              <option value="3" className="bg-[#1A1A1A] text-white">Casa</option>
              <option value="1" className="bg-[#1A1A1A] text-white">Apartaestudio</option>
              <option value="4" className="bg-[#1A1A1A] text-white">Local Comercial</option>
              <option value="5" className="bg-[#1A1A1A] text-white">Bodega</option>
              <option value="6" className="bg-[#1A1A1A] text-white">Finca</option>
              <option value="7" className="bg-[#1A1A1A] text-white">Lote</option>
            </select>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-gold hover:bg-gold-hover text-[#0D0D0D] font-body font-semibold text-sm tracking-wide rounded-lg transition-all duration-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}
