'use client';

import { useState, useEffect, useCallback } from 'react';

interface Property {
  id_property: number;
  title: string;
  property_type_label?: string;
  city_label?: string;
  zone_label?: string;
  location_label?: string;
  sale_price: number;
  rent_price: number;
  sale_price_label?: string;
  rent_price_label?: string;
  for_sale?: boolean;
  for_rent?: boolean;
  main_image?: { url?: string; url_big?: string; url_original?: string };
  bedrooms: number;
  bathrooms: number;
  area: number;
  garages: number;
  address?: string;
  observations?: string;
  stratum?: number;
  floor?: number;
  built_area?: number;
  id_property_type?: number;
}

interface PropertyType {
  id_property_type: number;
  name: string;
  count: number;
}

interface LocationOption {
  id: number;
  name: string;
}

// ─── FORM MODAL ────────────────────────────────────────────────────────────
interface PropertyFormProps {
  property?: Property | null;
  onClose: () => void;
  onSaved: () => void;
}

function PropertyFormModal({ property, onClose, onSaved }: PropertyFormProps) {
  const isEditing = !!property;

  const [form, setForm] = useState({
    title: property?.title || '',
    for_sale: property?.for_sale ?? true,
    for_rent: property?.for_rent ?? false,
    sale_price: property?.sale_price || 0,
    rent_price: property?.rent_price || 0,
    id_property_type: property?.id_property_type || 2,
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    garages: property?.garages || 0,
    area: property?.area || 0,
    built_area: property?.built_area || 0,
    floor: property?.floor || 0,
    stratum: property?.stratum || 0,
    address: property?.address || '',
    observations: property?.observations || '',
    id_country: 1,
    id_region: 2,
    id_city: 496,
    id_zone: 0,
    id_property_condition: 1,
    id_status_on_page: 1,
  });

  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [regions, setRegions] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [zones, setZones] = useState<LocationOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/locations?type=property-types').then(r => r.json()).then(d => setPropertyTypes(d.data || []));
    fetch('/api/locations?type=regions&country=1').then(r => r.json()).then(d => setRegions(d.data || []));
  }, []);

  useEffect(() => {
    if (form.id_region) {
      fetch(`/api/locations?type=cities&region=${form.id_region}`).then(r => r.json()).then(d => setCities(d.data || []));
    }
  }, [form.id_region]);

  useEffect(() => {
    if (form.id_city) {
      fetch(`/api/locations?type=zones&city=${form.id_city}`).then(r => r.json()).then(d => setZones(d.data || []));
    }
  }, [form.id_city]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setForm(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload: Record<string, unknown> = { ...form };
      if (!payload.id_zone) delete payload.id_zone;

      let res: Response;
      if (isEditing && property) {
        res = await fetch(`/api/properties/${property.id_property}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        payload.for_transfer = false;
        res = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccess(isEditing ? 'Propiedad actualizada exitosamente' : `Propiedad creada exitosamente (ID: ${data.id_property})`);
        setTimeout(() => { onSaved(); onClose(); }, 1500);
      } else {
        setError(data.error || 'Error al guardar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A962]/60 transition-colors';
  const labelClass = 'block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wider';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-3xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <div>
            <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Propiedad' : 'Nueva Propiedad'}</h2>
            {isEditing && <p className="text-xs text-[#666] mt-1">ID: {property?.id_property}</p>}
          </div>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">{success}</div>}

          {/* Title */}
          <div>
            <label className={labelClass}>Título</label>
            <input name="title" value={form.title} onChange={handleChange} required className={inputClass} placeholder="Ej: Apartamento en Laureles" />
          </div>

          {/* Business type */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 bg-[#111] border border-[#333] rounded-lg px-4 py-3 cursor-pointer hover:border-[#C9A962]/40 transition-colors">
              <input type="checkbox" name="for_sale" checked={form.for_sale} onChange={handleChange} className="accent-[#C9A962] w-4 h-4" />
              <span className="text-sm text-white">En Venta</span>
            </label>
            <label className="flex items-center gap-3 bg-[#111] border border-[#333] rounded-lg px-4 py-3 cursor-pointer hover:border-[#C9A962]/40 transition-colors">
              <input type="checkbox" name="for_rent" checked={form.for_rent} onChange={handleChange} className="accent-[#C9A962] w-4 h-4" />
              <span className="text-sm text-white">En Arriendo</span>
            </label>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Precio Venta (COP)</label>
              <input type="number" name="sale_price" value={form.sale_price} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Precio Arriendo (COP)</label>
              <input type="number" name="rent_price" value={form.rent_price} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Property type + condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de propiedad</label>
              <select name="id_property_type" value={form.id_property_type} onChange={handleChange} className={inputClass}>
                {propertyTypes.map(pt => (
                  <option key={pt.id_property_type} value={pt.id_property_type}>{pt.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Condición</label>
              <select name="id_property_condition" value={form.id_property_condition} onChange={handleChange} className={inputClass}>
                <option value={1}>Nuevo</option>
                <option value={2}>Usado</option>
                <option value={3}>Remodelado</option>
              </select>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Habitaciones</label>
              <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} min={0} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Baños</label>
              <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} min={0} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Garajes</label>
              <input type="number" name="garages" value={form.garages} onChange={handleChange} min={0} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Estrato</label>
              <input type="number" name="stratum" value={form.stratum} onChange={handleChange} min={0} max={6} className={inputClass} />
            </div>
          </div>

          {/* Area + floor */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Área total (m²)</label>
              <input type="number" name="area" value={form.area} onChange={handleChange} min={0} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Área construida (m²)</label>
              <input type="number" name="built_area" value={form.built_area} onChange={handleChange} min={0} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Piso</label>
              <input type="number" name="floor" value={form.floor} onChange={handleChange} min={0} className={inputClass} />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Departamento</label>
              <select name="id_region" value={form.id_region} onChange={(e) => { handleChange(e); setForm(prev => ({ ...prev, id_city: 0, id_zone: 0 })); }} className={inputClass}>
                <option value={0}>Seleccionar...</option>
                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Ciudad</label>
              <select name="id_city" value={form.id_city} onChange={(e) => { handleChange(e); setForm(prev => ({ ...prev, id_zone: 0 })); }} className={inputClass}>
                <option value={0}>Seleccionar...</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Zona</label>
              <select name="id_zone" value={form.id_zone} onChange={handleChange} className={inputClass}>
                <option value={0}>Seleccionar...</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className={labelClass}>Dirección</label>
            <input name="address" value={form.address} onChange={handleChange} className={inputClass} placeholder="Ej: Cra 76 #35-20" />
          </div>

          {/* Observations */}
          <div>
            <label className={labelClass}>Descripción / Observaciones</label>
            <textarea name="observations" value={form.observations} onChange={handleChange} rows={4} className={inputClass + ' resize-none'} placeholder="Descripción detallada de la propiedad..." />
          </div>

          {/* Status on page */}
          <div>
            <label className={labelClass}>Estado en página</label>
            <select name="id_status_on_page" value={form.id_status_on_page} onChange={handleChange} className={inputClass}>
              <option value={1}>Publicado</option>
              <option value={2}>No publicado</option>
              <option value={3}>Destacado</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-[#222] hover:bg-[#333] text-white py-3 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 bg-[#C9A962] hover:bg-[#b89952] disabled:opacity-50 text-black py-3 rounded-lg text-sm font-bold transition-colors">
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear propiedad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function PropiedadesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'rent'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deactivating, setDeactivating] = useState<number | null>(null);

  const itemsPerPage = 12;

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const filters: Record<string, unknown> = {
        take: itemsPerPage,
        skip: (currentPage - 1) * itemsPerPage,
      };
      if (filterType === 'sale') filters.id_property_type_business = '1';
      if (filterType === 'rent') filters.id_property_type_business = '2';

      const response = await fetch('/api/properties/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      const props = data.properties || [];
      setProperties(Array.isArray(props) ? props : []);
      setTotalProperties(data.total || props.length || 0);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredProperties = properties.filter((prop) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const location = prop.location_label || prop.zone_label || prop.city_label || '';
    return (
      (prop.title || '').toLowerCase().includes(search) ||
      location.toLowerCase().includes(search) ||
      String(prop.id_property).includes(search)
    );
  });

  const totalPages = Math.ceil(totalProperties / itemsPerPage);

  const bestImageUrl = (img?: { url?: string; url_big?: string; url_original?: string }) => {
    return img?.url_big || img?.url || img?.url_original || '';
  };

  const handleCopyLink = (propertyId: number) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://indubienes.com';
    const link = `${baseUrl}/propiedad/${propertyId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(propertyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeactivate = async (prop: Property) => {
    if (!confirm(`¿Desactivar "${prop.title}"?\nSe cambiará a "No publicado" en WASI.`)) return;
    setDeactivating(prop.id_property);
    try {
      const res = await fetch(`/api/properties/${prop.id_property}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_status_on_page: 2 }),
      });
      if (res.ok) {
        fetchProperties();
      } else {
        alert('Error al desactivar la propiedad');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setDeactivating(null);
    }
  };

  const handleEdit = async (prop: Property) => {
    try {
      const res = await fetch(`/api/properties/${prop.id_property}`);
      const data = await res.json();
      setEditingProperty(data.property || prop);
    } catch {
      setEditingProperty(prop);
    }
    setShowForm(true);
  };

  const formatPrice = (price: number) => {
    if (!price) return '';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Propiedades</h1>
          <div className="h-1 w-16 bg-[#C9A962] rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm text-[#888] hidden sm:block">
            <p>Total: {totalProperties}</p>
            <p className="text-xs mt-1">Mostrando {filteredProperties.length}</p>
          </div>
          <button
            onClick={() => { setEditingProperty(null); setShowForm(true); }}
            className="bg-[#C9A962] hover:bg-[#b89952] text-black font-bold px-5 py-3 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nueva Propiedad
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar por título, ubicación o ID..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="flex-1 bg-[#1a1a1a] border border-[#222] rounded-lg px-4 py-3 text-white placeholder:text-[#555] focus:outline-none focus:border-[#C9A962]/50 transition-colors"
        />
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value as 'all' | 'sale' | 'rent'); setCurrentPage(1); }}
          className="bg-[#1a1a1a] border border-[#222] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C9A962]/50 transition-colors cursor-pointer"
        >
          <option value="all">Todas las propiedades</option>
          <option value="sale">En venta</option>
          <option value="rent">En alquiler</option>
        </select>
      </div>

      {/* Properties Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-[#222] rounded-xl overflow-hidden animate-pulse">
                <div className="h-40 bg-[#222]" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-[#222] rounded w-3/4" />
                  <div className="h-3 bg-[#222] rounded w-1/2" />
                  <div className="h-3 bg-[#222] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProperties.map((property) => {
              const imageUrl = bestImageUrl(property.main_image);
              const isSale = property.for_sale || property.sale_price > 0;
              const price = isSale
                ? (property.sale_price_label || formatPrice(property.sale_price))
                : (property.rent_price_label || formatPrice(property.rent_price));
              const location = property.location_label || `${property.zone_label || ''}, ${property.city_label || ''}`;

              return (
                <div key={property.id_property} className="bg-[#1a1a1a] border border-[#222] rounded-xl overflow-hidden hover:border-[#C9A962]/30 transition-all group">
                  {/* Image */}
                  <div className="relative h-40 bg-[#222] overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${isSale ? 'bg-[#C9A962] text-black' : 'bg-green-500/80 text-white'}`}>
                        {isSale ? 'Venta' : 'Arriendo'}
                      </span>
                      {property.property_type_label && (
                        <span className="text-xs px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-white">{property.property_type_label}</span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 text-[#888] font-mono">#{property.id_property}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-[#C9A962] transition-colors">{property.title}</h3>
                      <p className="text-xs text-[#888] mt-1 truncate">{location}</p>
                    </div>
                    <div className="flex gap-3 text-xs text-[#888]">
                      {property.bedrooms > 0 && <span>{property.bedrooms} hab</span>}
                      {property.bathrooms > 0 && <span>{property.bathrooms} baños</span>}
                      {property.area > 0 && <span>{property.area} m²</span>}
                      {property.garages > 0 && <span>{property.garages} gar</span>}
                    </div>
                    <div className="pt-2 border-t border-[#222]">
                      <p className="text-lg font-bold text-[#C9A962]">{price}</p>
                    </div>

                    {/* CRUD Actions */}
                    <div className="grid grid-cols-4 gap-1.5 pt-2">
                      <button onClick={() => handleEdit(property)} className="bg-[#222] hover:bg-blue-500/20 text-blue-400 text-xs py-2 rounded transition-colors flex items-center justify-center" title="Editar">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleCopyLink(property.id_property)} className="bg-[#222] hover:bg-[#C9A962]/20 text-[#C9A962] text-xs py-2 rounded transition-colors flex items-center justify-center" title="Copiar link">
                        {copiedId === property.id_property ? (
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        )}
                      </button>
                      <a href={`/propiedad/${property.id_property}`} target="_blank" rel="noopener noreferrer" className="bg-[#222] hover:bg-[#C9A962]/20 text-[#C9A962] text-xs py-2 rounded transition-colors flex items-center justify-center" title="Ver">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </a>
                      <button onClick={() => handleDeactivate(property)} disabled={deactivating === property.id_property} className="bg-[#222] hover:bg-red-500/20 text-red-400 text-xs py-2 rounded transition-colors flex items-center justify-center disabled:opacity-50" title="Desactivar">
                        {deactivating === property.id_property ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-12 text-center">
            <svg className="w-12 h-12 text-[#444] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-[#888]">No se encontraron propiedades</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-[#1a1a1a] border border-[#222] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#C9A962]/30 transition-colors">
            Anterior
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              let pageNum: number;
              if (totalPages <= 7) { pageNum = i + 1; }
              else if (currentPage <= 4) { pageNum = i + 1; }
              else if (currentPage >= totalPages - 3) { pageNum = totalPages - 6 + i; }
              else { pageNum = currentPage - 3 + i; }
              return (
                <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-10 h-10 rounded-lg transition-colors ${currentPage === pageNum ? 'bg-[#C9A962] text-black font-bold' : 'bg-[#1a1a1a] border border-[#222] text-white hover:border-[#C9A962]/30'}`}>
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-[#1a1a1a] border border-[#222] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#C9A962]/30 transition-colors">
            Siguiente
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <PropertyFormModal
          property={editingProperty}
          onClose={() => { setShowForm(false); setEditingProperty(null); }}
          onSaved={fetchProperties}
        />
      )}
    </div>
  );
}
