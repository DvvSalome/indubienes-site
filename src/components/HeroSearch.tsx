'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomSelect from './CustomSelect';

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

  const tipoOptions = [
    { value: 'venta', label: 'Venta' },
    { value: 'arriendo', label: 'Arriendo' },
  ];

  const propiedadOptions = [
    { value: '', label: 'Tipo de propiedad' },
    { value: '2', label: 'Apartamento' },
    { value: '3', label: 'Casa' },
    { value: '1', label: 'Apartaestudio' },
    { value: '4', label: 'Local Comercial' },
    { value: '5', label: 'Bodega' },
    { value: '6', label: 'Finca' },
    { value: '7', label: 'Lote' },
  ];

  return (
    <div className="hero-search">
      <div className="bg-black/30 backdrop-blur-2xl rounded-2xl p-3 sm:p-4 max-w-3xl mx-auto border border-white/[0.08] shadow-2xl shadow-black/20 overflow-visible">
        <div className="flex flex-col sm:flex-row gap-3 overflow-visible">
          <div className="flex-1">
            <CustomSelect
              options={tipoOptions}
              value={tipoNegocio}
              onChange={setTipoNegocio}
              variant="hero"
            />
          </div>
          <div className="flex-1">
            <CustomSelect
              options={propiedadOptions}
              value={tipoPropiedad}
              onChange={setTipoPropiedad}
              placeholder="Tipo de propiedad"
              variant="hero"
            />
          </div>
          <button
            onClick={handleSearch}
            className="group flex items-center justify-center gap-2 px-8 py-3 bg-gold hover:bg-gold-hover text-white font-body font-semibold text-sm tracking-wide rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-gold/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:scale-110">
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
