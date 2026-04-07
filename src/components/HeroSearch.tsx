'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

/* ───────────────────────────────────────────
   Zona data — sourced from active WASI properties
   ─────────────────────────────────────────── */
const ZONAS = [
  // Medellín
  { value: '50311', label: 'Laureles' },
  { value: '48200', label: 'Laureles Primer Parque' },
  { value: '47423', label: 'Laureles Segundo Parque' },
  { value: '231965', label: 'Laureles, Almería' },
  { value: '886207', label: 'Laureles Lorena' },
  { value: '211106', label: 'Poblado' },
  { value: '892075', label: 'Castropol' },
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
  { value: '72521', label: 'Centro' },
  { value: '960199', label: 'Naranjal' },
  { value: '932231', label: 'Loma del Indio' },
  { value: '409818', label: 'Belén Fátima' },
  { value: '763177', label: 'Belén Malibú' },
  { value: '762261', label: 'Los Ángeles' },
  // Área Metropolitana
  { value: '764870', label: 'Envigado' },
  { value: '200814', label: 'Envigado, Zuñiga' },
  { value: '63349', label: 'Loma del Escobero' },
  { value: '837159', label: 'Itagüí' },
  { value: '856925', label: 'Mayorca' },
  { value: '762455', label: 'La Estrella' },
  { value: '763433', label: 'Bello' },
  { value: '880201', label: 'Copacabana' },
  { value: '698', label: 'Sabaneta' },
  // Oriente
  { value: '100177', label: 'Rionegro' },
  { value: '59154', label: 'La Ceja' },
  { value: '677', label: 'El Retiro' },
  { value: '934385', label: 'Guatapé' },
  { value: '880242', label: 'San Rafael' },
  { value: '728544', label: 'Santa Elena' },
];

const TIPOS_PROPIEDAD = [
  { value: '2', label: 'Apartamento' },
  { value: '3', label: 'Casa' },
  { value: '1', label: 'Apartaestudio' },
  { value: '4', label: 'Local Comercial' },
  { value: '5', label: 'Bodega' },
  { value: '6', label: 'Finca' },
  { value: '7', label: 'Lote' },
];

/* ───────────────────────────────────────────
   Searchable Location Input
   ─────────────────────────────────────────── */
function LocationInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ddRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const selectedLabel = ZONAS.find((z) => z.value === value)?.label || '';

  const filtered = query.trim()
    ? ZONAS.filter((z) =>
        z.label.toLowerCase().includes(query.toLowerCase())
      )
    : ZONAS;

  const updatePos = useCallback(() => {
    if (wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 260) });
    }
  }, []);

  useEffect(() => {
    if (open) {
      updatePos();
      window.addEventListener('scroll', updatePos, true);
      window.addEventListener('resize', updatePos);
      return () => {
        window.removeEventListener('scroll', updatePos, true);
        window.removeEventListener('resize', updatePos);
      };
    }
  }, [open, updatePos]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        wrapRef.current && !wrapRef.current.contains(t) &&
        ddRef.current && !ddRef.current.contains(t)
      ) {
        setOpen(false);
        if (!value) setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [open]);

  const handleSelect = (z: { value: string; label: string }) => {
    onChange(z.value);
    setQuery(z.label);
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setQuery('');
    inputRef.current?.focus();
  };

  const dropdown = (
    <div
      ref={ddRef}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 9999,
      }}
      className={`rounded-xl overflow-hidden shadow-2xl bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/[0.12] transition-all duration-200 origin-top ${
        open ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'
      }`}
    >
      <div className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
        {filtered.length === 0 && (
          <div className="px-4 py-3 text-white/40 text-sm font-body">
            No se encontraron sectores
          </div>
        )}
        {filtered.map((z) => (
          <button
            key={z.value}
            type="button"
            onClick={() => handleSelect(z)}
            className={`w-full text-left px-4 py-2 text-[13px] font-body transition-all duration-200 ${
              z.value === value
                ? 'text-gold bg-gold/10'
                : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <span className="flex items-center justify-between">
              {z.label}
              {z.value === value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold flex-shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative flex items-center">
        {/* Search icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3.5 text-white/40 pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={open ? query : (value ? selectedLabel : query)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onChange('');
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            if (value) setQuery(selectedLabel);
          }}
          placeholder="¿Dónde buscas?"
          className="w-full bg-white/[0.07] border border-white/[0.12] hover:border-gold/40 focus:border-gold/60 focus:shadow-[0_0_0_2px_rgba(201,169,98,0.15)] text-white placeholder-white/40 rounded-xl pl-10 pr-8 py-2.5 text-sm font-body transition-all duration-300 outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-white/40 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      {mounted && createPortal(dropdown, document.body)}
    </div>
  );
}

/* ───────────────────────────────────────────
   Pill Selector (Venta / Arriendo)
   ─────────────────────────────────────────── */
function PillSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-white/[0.12] bg-white/[0.05]">
      {[
        { val: 'venta', label: 'Venta' },
        { val: 'arriendo', label: 'Arriendo' },
      ].map((opt) => (
        <button
          key={opt.val}
          type="button"
          onClick={() => onChange(opt.val)}
          className={`flex-1 py-2.5 text-sm font-body font-medium tracking-wide transition-all duration-300 ${
            value === opt.val
              ? 'bg-white/[0.15] text-white'
              : 'text-white/45 hover:text-white/70 hover:bg-white/[0.05]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────
   Mini Select (Tipo de propiedad)
   ─────────────────────────────────────────── */
function MiniSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const ddRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  const updatePos = useCallback(() => {
    if (wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 200) });
    }
  }, []);

  useEffect(() => {
    if (open) {
      updatePos();
      window.addEventListener('scroll', updatePos, true);
      window.addEventListener('resize', updatePos);
      return () => {
        window.removeEventListener('scroll', updatePos, true);
        window.removeEventListener('resize', updatePos);
      };
    }
  }, [open, updatePos]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        wrapRef.current && !wrapRef.current.contains(t) &&
        ddRef.current && !ddRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [open]);

  const dropdown = (
    <div
      ref={ddRef}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 9999,
      }}
      className={`rounded-xl overflow-hidden shadow-2xl bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/[0.12] transition-all duration-200 origin-top ${
        open ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'
      }`}
    >
      <div className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false); }}
            className={`w-full text-left px-4 py-2 text-[13px] font-body transition-all duration-200 ${
              opt.value === value
                ? 'text-gold bg-gold/10'
                : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <span className="flex items-center justify-between">
              {opt.label}
              {opt.value === value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold flex-shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-body transition-all duration-300 bg-white/[0.07] border border-white/[0.12] hover:border-gold/40 text-white ${
          open ? 'border-gold/60 shadow-[0_0_0_2px_rgba(201,169,98,0.15)]' : ''
        }`}
      >
        <span className={value ? '' : 'opacity-45'}>{selectedLabel}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </div>
  );
}

/* ───────────────────────────────────────────
   HeroSearch — main component
   ─────────────────────────────────────────── */
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

  return (
    <div className="hero-search">
      <div className="bg-black/25 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 max-w-2xl mx-auto border border-white/[0.08] shadow-2xl shadow-black/30">

        {/* Row 1: Pill toggle Venta/Arriendo */}
        <div className="mb-3">
          <PillSelector value={tipoNegocio} onChange={setTipoNegocio} />
        </div>

        {/* Row 2: Location search + Property type */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="flex-[1.4] min-w-0">
            <LocationInput value={zona} onChange={setZona} />
          </div>
          <div className="flex-1 min-w-0">
            <MiniSelect
              options={TIPOS_PROPIEDAD}
              value={tipoPropiedad}
              onChange={setTipoPropiedad}
              placeholder="Tipo de propiedad"
            />
          </div>
        </div>

        {/* Row 3: Search button full width */}
        <button
          onClick={handleSearch}
          className="group w-full flex items-center justify-center gap-2.5 px-8 py-3 bg-gold hover:bg-gold-hover text-white font-body font-semibold text-sm tracking-wide rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-gold/25"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:scale-110">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Buscar propiedades
        </button>
      </div>
    </div>
  );
}
