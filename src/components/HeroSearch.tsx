'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomSelect from './CustomSelect';

export default function HeroSearch() {
  const router = useRouter();
  const [tipoNegocio, setTipoNegocio] = useState('venta');
  const [tipoPropiedad, setTipoPropiedad] = useState('');
  const [zona, setZona] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (tipoNegocio) params.set('tipo', tipoNegocio);
    if (tipoPropiedad) params.set('propiedad', tipoPropiedad);
    if (zona) params.set('zona', zona);
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

  // Zones sourced from active WASI properties, grouped by city
  const zonaOptions = [
    { value: '', label: 'Sector / Ubicación' },
    // — Medellín —
    { value: '50311', label: 'Laureles' },
    { value: '48200', label: 'Laureles Primer Parque' },
    { value: '47423', label: 'Laureles Segundo Parque' },
    { value: '231965', label: 'Laureles, Almería' },
    { value: '886207', label: 'Laureles Lorena' },
    { value: '38463', label: 'Laureles Zona 3' },
    { value: '211106', label: 'Poblado' },
    { value: '892075', label: 'Castropol, Poblado' },
    { value: '881414', label: 'Poblado La Calera' },
    { value: '48794', label: 'Velódromo' },
    { value: '38672', label: 'Los Colores' },
    { value: '58747', label: 'La América' },
    { value: '880236', label: 'Calasanz' },
    { value: '101121', label: 'La Castellana' },
    { value: '100202', label: 'Florida Nueva' },
    { value: '310092', label: 'Guayabal' },
    { value: '832897', label: 'Ciudad del Río' },
    { value: '209854', label: 'San Diego' },
    { value: '358456', label: 'Boston' },
    { value: '97338', label: 'Buenos Aires' },
    { value: '606584', label: 'Aranjuez' },
    { value: '97199', label: 'Manrique' },
    { value: '105160', label: 'Villa Hermosa' },
    { value: '98388', label: 'San Javier' },
    { value: '45402', label: 'San Germán' },
    { value: '50425', label: 'Simón Bolívar' },
    { value: '168833', label: 'Prado Centro' },
    { value: '72521', label: 'Centro de Medellín' },
    { value: '960199', label: 'Naranjal' },
    { value: '932231', label: 'Loma del Indio' },
    { value: '409818', label: 'Belén Fátima' },
    { value: '763177', label: 'Belén Malibú' },
    { value: '762261', label: 'Los Ángeles' },
    // — Área Metropolitana —
    { value: '764870', label: 'Envigado' },
    { value: '200814', label: 'Envigado, Zuñiga' },
    { value: '63349', label: 'Loma del Escobero' },
    { value: '698', label: 'Sabaneta' },
    { value: '837159', label: 'Itagüí' },
    { value: '856925', label: 'Mayorca' },
    { value: '762455', label: 'La Estrella' },
    { value: '299674', label: 'La Tablaza, La Estrella' },
    { value: '763433', label: 'Bello, Villa del Sol' },
    { value: '880201', label: 'Copacabana' },
    // — Oriente —
    { value: '100177', label: 'Rionegro' },
    { value: '59154', label: 'La Ceja' },
    { value: '677', label: 'El Retiro' },
    { value: '934385', label: 'Guatapé' },
    { value: '880242', label: 'San Rafael' },
    { value: '728544', label: 'Santa Elena' },
  ];

  return (
    <div className="hero-search">
      <div className="bg-black/30 backdrop-blur-2xl rounded-2xl p-3 sm:p-4 max-w-4xl mx-auto border border-white/[0.08] shadow-2xl shadow-black/20 overflow-visible">
        <div className="flex flex-col sm:flex-row gap-3 overflow-visible">
          <div className="flex-1 min-w-0">
            <CustomSelect
              options={zonaOptions}
              value={zona}
              onChange={setZona}
              placeholder="Sector / Ubicación"
              variant="hero"
            />
          </div>
          <div className="flex-1 min-w-0">
            <CustomSelect
              options={tipoOptions}
              value={tipoNegocio}
              onChange={setTipoNegocio}
              variant="hero"
            />
          </div>
          <div className="flex-1 min-w-0">
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
