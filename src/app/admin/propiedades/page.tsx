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
  private_area?: number;
  year_built?: number;
  maintenance_fee?: number;
  id_property_type?: number;
  internal_feature_ids?: number[];
  external_feature_ids?: number[];
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

interface FeatureOption {
  id: number;
  name: string;
}

interface FeatureGroups {
  internal: FeatureOption[];
  external: FeatureOption[];
}

// A file queued for upload after a brand-new property is created.
interface QueuedPhoto {
  id: string;
  file: File;
  blob: Blob;
  preview: string;
}

// Strip HTML tags and decode HTML entities for clean text display
function stripHtml(html: string): string {
  if (!html) return '';
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '\n');
  // Decode common HTML entities
  text = text.replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
    .replace(/&oacute;/g, 'ó').replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
    .replace(/&Oacute;/g, 'Ó').replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í').replace(/&Uacute;/g, 'Ú').replace(/&Ntilde;/g, 'Ñ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&sup2;/g, '²').replace(/&sup3;/g, '³');
  // Collapse multiple newlines
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

// Format number with Colombian thousand separators
function formatCOP(value: number): string {
  if (!value) return '';
  return new Intl.NumberFormat('es-CO').format(value);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for potential future use
function parseCOP(str: string): number {
  return Number(str.replace(/\./g, '').replace(/,/g, '')) || 0;
}

// Compress image client-side: resize to max dimension, convert to JPEG Blob (for multipart upload)
// + return a tiny dataURL for local preview.
async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.82
): Promise<{ blob: Blob; preview: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('No se pudo generar el blob'));
            const preview = canvas.toDataURL('image/jpeg', 0.5);
            resolve({ blob, preview });
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── IMAGE UPLOAD COMPONENT ───────────────────────────────────────────────
function ImageUploader({ propertyId, onUploaded }: { propertyId: number; onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError('');
    setSuccess('');

    const totalFiles = files.length;
    let uploaded = 0;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      setProgress(`Comprimiendo ${i + 1}/${totalFiles}...`);

      try {
        // Compress to JPEG blob + preview
        const { blob, preview } = await compressImage(file);
        setPreview(preview);

        setProgress(`Subiendo ${i + 1}/${totalFiles}...`);

        // Multipart upload to WASI via our new dedicated endpoint
        const formData = new FormData();
        formData.append('image', blob, `property-${propertyId}-${Date.now()}-${i}.jpg`);
        formData.append('position', String(i + 1));

        const res = await fetch(`/api/properties/${propertyId}/upload-image`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.status === 'success') {
          uploaded++;
        } else {
          setError(data.error || `Error al subir imagen ${i + 1}`);
        }
      } catch (err) {
        console.error('upload error', err);
        setError(`Error procesando imagen ${i + 1}`);
      }
    }

    if (uploaded > 0) {
      setSuccess(`${uploaded} imagen${uploaded > 1 ? 'es subidas' : ' subida'} correctamente`);
      onUploaded();
    }

    setUploading(false);
    setProgress('');
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={handleFileSelect}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed transition-all ${
            uploading
              ? 'border-[#4A8BC2]/50 bg-[#4A8BC2]/5'
              : 'border-[#333] hover:border-[#4A8BC2]/40 bg-[#111] hover:bg-[#4A8BC2]/5 cursor-pointer'
          }`}
        >
          {uploading ? (
            <>
              <svg className="w-6 h-6 text-[#4A8BC2] animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
              <span className="text-xs text-[#4A8BC2]">{progress}</span>
            </>
          ) : (
            <>
              <svg className="w-8 h-8 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-xs text-[#888]">Toca para subir fotos</span>
              <span className="text-[10px] text-[#555]">Se comprimen automáticamente sin perder calidad</span>
            </>
          )}
        </label>
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-[#333]">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-green-400">{success}</p>}
    </div>
  );
}

// ─── COUNTER COMPONENT ────────────────────────────────────────────────────
function CounterInput({ label, icon, value, onChange, min = 0, max = 99 }: {
  label: string; icon: string; value: number;
  onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-[#888] uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg bg-[#222] hover:bg-[#333] text-white flex items-center justify-center transition-colors text-lg font-bold">−</button>
        <div className="w-12 h-10 bg-[#111] border border-[#333] rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">{icon} {value}</span>
        </div>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-lg bg-[#222] hover:bg-[#333] text-white flex items-center justify-center transition-colors text-lg font-bold">+</button>
      </div>
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-[#222]">
      <span className="text-[#4A8BC2]">{icon}</span>
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
    </div>
  );
}

// ─── FORM MODAL ────────────────────────────────────────────────────────────
interface PropertyFormProps {
  property?: Property | null;
  onClose: () => void;
  onSaved: () => void;
  onCreated?: (id: number) => void;
}

function PropertyFormModal({ property, onClose, onSaved, onCreated }: PropertyFormProps) {
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
    private_area: property?.private_area || 0,
    floor: property?.floor || 0,
    stratum: property?.stratum || 0,
    year_built: property?.year_built || 0,
    maintenance_fee: property?.maintenance_fee || 0,
    address: property?.address || '',
    observations: stripHtml(property?.observations || ''),
    id_country: 1,
    id_region: 2,
    id_city: 496,
    id_zone: 0,
    id_property_condition: 2,
    id_status_on_page: 1,
    internal_features: property?.internal_feature_ids || [] as number[],
    external_features: property?.external_feature_ids || [] as number[],
  });

  // Formatted price display strings
  const [salePriceDisplay, setSalePriceDisplay] = useState(formatCOP(property?.sale_price || 0));
  const [rentPriceDisplay, setRentPriceDisplay] = useState(formatCOP(property?.rent_price || 0));
  const [feeDisplay, setFeeDisplay] = useState(formatCOP(property?.maintenance_fee || 0));

  const [activeTab, setActiveTab] = useState<'info' | 'specs' | 'features' | 'location' | 'details'>('info');
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [regions, setRegions] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [zones, setZones] = useState<LocationOption[]>([]);
  const [featureCatalog, setFeatureCatalog] = useState<FeatureGroups>({ internal: [], external: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Queue of photos selected BEFORE the property exists. After createProperty
  // succeeds we loop through these and upload them via the upload-image endpoint.
  const [pendingPhotos, setPendingPhotos] = useState<QueuedPhoto[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  useEffect(() => {
    const ac = new AbortController();
    fetch('/api/locations?type=property-types', { signal: ac.signal }).then(r => r.json()).then(d => setPropertyTypes(d.data || [])).catch(() => {});
    fetch('/api/locations?type=regions&country=1', { signal: ac.signal }).then(r => r.json()).then(d => setRegions(d.data || [])).catch(() => {});
    fetch('/api/locations?type=features', { signal: ac.signal }).then(r => r.json()).then(d => {
      if (d.data && (d.data.internal || d.data.external)) {
        setFeatureCatalog({ internal: d.data.internal || [], external: d.data.external || [] });
      }
    }).catch(() => { /* non-fatal — features are optional */ });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (!form.id_region) return;
    const ac = new AbortController();
    fetch(`/api/locations?type=cities&region=${form.id_region}`, { signal: ac.signal }).then(r => r.json()).then(d => setCities(d.data || [])).catch(() => {});
    return () => ac.abort();
  }, [form.id_region]);

  useEffect(() => {
    if (!form.id_city) return;
    const ac = new AbortController();
    fetch(`/api/locations?type=zones&city=${form.id_city}`, { signal: ac.signal }).then(r => r.json()).then(d => setZones(d.data || [])).catch(() => {});
    return () => ac.abort();
  }, [form.id_city]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceChange = (field: 'sale_price' | 'rent_price' | 'maintenance_fee', raw: string) => {
    const digits = raw.replace(/\D/g, '');
    const num = Number(digits) || 0;
    const formatted = formatCOP(num);
    if (field === 'sale_price') { setSalePriceDisplay(formatted); setForm(prev => ({ ...prev, sale_price: num })); }
    else if (field === 'rent_price') { setRentPriceDisplay(formatted); setForm(prev => ({ ...prev, rent_price: num })); }
    else { setFeeDisplay(formatted); setForm(prev => ({ ...prev, maintenance_fee: num })); }
  };

  // Exclusive business type selector: "sale" | "rent" | "both"
  const businessMode: 'sale' | 'rent' | 'both' =
    form.for_sale && form.for_rent ? 'both' : form.for_rent ? 'rent' : 'sale';
  const setBusinessMode = (mode: 'sale' | 'rent' | 'both') => {
    setForm(prev => ({
      ...prev,
      for_sale: mode === 'sale' || mode === 'both',
      for_rent: mode === 'rent' || mode === 'both',
    }));
  };

  // Toggle a feature ID in the given group's selection
  const toggleFeature = (group: 'internal_features' | 'external_features', id: number) => {
    setForm(prev => {
      const current = prev[group] as number[];
      const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
      return { ...prev, [group]: next };
    });
  };

  const removeQueuedPhoto = (id: string) => {
    setPendingPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleQueuePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setError('');
    try {
      const newQueued: QueuedPhoto[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const { blob, preview } = await compressImage(file);
        newQueued.push({
          id: `${Date.now()}-${i}-${file.name}`,
          file,
          blob,
          preview,
        });
      }
      setPendingPhotos(prev => [...prev, ...newQueued]);
    } catch (err) {
      console.error('queue photos error', err);
      setError('Error procesando las fotos. Intenta con otras imágenes.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return; // Prevent concurrent submissions (race condition guard)
    setError('');
    setSuccess('');

    // ── Frontend validation before hitting WASI ──────────────────────────
    if (!form.title.trim()) {
      setActiveTab('info');
      setError('El título es obligatorio.');
      return;
    }
    if (!form.for_sale && !form.for_rent) {
      setActiveTab('info');
      setError('Debes marcar al menos un tipo de negocio: Venta o Arriendo.');
      return;
    }
    if (form.for_sale && form.sale_price <= 0) {
      setActiveTab('info');
      setError('El precio de venta debe ser mayor que 0.');
      return;
    }
    if (form.for_rent && form.rent_price <= 0) {
      setActiveTab('info');
      setError('El canon de arriendo debe ser mayor que 0.');
      return;
    }
    if (!form.id_region) {
      setActiveTab('location');
      setError('Debes seleccionar un departamento.');
      return;
    }
    if (!form.id_city) {
      setActiveTab('location');
      setError('Debes seleccionar una ciudad.');
      return;
    }
    if (!form.id_property_type) {
      setActiveTab('info');
      setError('Debes seleccionar un tipo de inmueble.');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (!payload.id_zone) delete payload.id_zone;

      // WASI read endpoint returns `building_date` but write endpoints only accept
      // that same key — `year_built` is silently ignored. Rename before sending.
      if (payload.year_built) {
        payload.building_date = payload.year_built;
      }
      delete payload.year_built;

      // WASI expects feature IDs as JSON arrays on `internal_features` / `external_features`.
      // Empty arrays also clear the selection, which is the expected behavior.

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

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status !== 'success') {
        // Surface WASI's real error message when available
        setError(data.error || data.message || `Error al guardar (HTTP ${res.status})`);
        return;
      }

      // For brand-new properties, upload any queued photos in sequence.
      const newId: number | undefined = data.id_property;
      if (!isEditing && newId && pendingPhotos.length > 0) {
        let uploaded = 0;
        for (let i = 0; i < pendingPhotos.length; i++) {
          const q = pendingPhotos[i];
          setUploadProgress(`Subiendo foto ${i + 1}/${pendingPhotos.length}...`);
          try {
            const formData = new FormData();
            formData.append('image', q.blob, `property-${newId}-${Date.now()}-${i}.jpg`);
            formData.append('position', String(i + 1));
            const upRes = await fetch(`/api/properties/${newId}/upload-image`, {
              method: 'POST',
              body: formData,
            });
            const upData = await upRes.json().catch(() => ({}));
            if (upRes.ok && upData.status === 'success') {
              uploaded++;
            }
          } catch (err) {
            console.error('queued upload error', err);
          }
        }
        setUploadProgress('');
        setSuccess(
          uploaded === pendingPhotos.length
            ? `Propiedad creada (ID: ${newId}) con ${uploaded} foto${uploaded === 1 ? '' : 's'} ✓`
            : `Propiedad creada (ID: ${newId}). ${uploaded} de ${pendingPhotos.length} fotos subidas.`
        );
      } else {
        setSuccess(isEditing ? 'Propiedad actualizada exitosamente' : `Propiedad creada (ID: ${newId}) ✓`);
      }

      setTimeout(() => {
        onSaved();
        onClose();
        // Only reopen editor if no photos were queued (fallback flow)
        if (!isEditing && newId && pendingPhotos.length === 0 && onCreated) {
          onCreated(newId);
        }
      }, 1500);
    } catch (err) {
      console.error('submit error', err);
      setError('Error de conexión — revisa tu internet e intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Prefer url_original (raw photo) — url/url_big apply fit:contain with white letterbox on portrait shots.
  const imageUrl = property?.main_image?.url_original || property?.main_image?.url_big || property?.main_image?.url;
  const inputClass = 'w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4A8BC2]/60 transition-colors';
  const labelClass = 'block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wider';

  const tabs = [
    { id: 'info' as const, label: 'Información', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'specs' as const, label: 'Espacios', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { id: 'features' as const, label: 'Comodidades', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> },
    { id: 'location' as const, label: 'Ubicación', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'details' as const, label: 'Detalles', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-2xl shadow-2xl">
        {/* Header with property image preview */}
        <div className="relative">
          {isEditing && imageUrl && (
            <div className="h-32 rounded-t-2xl overflow-hidden relative">
              <img src={imageUrl} alt="" className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a1a1a]" />
            </div>
          )}
          <div className={`flex items-center justify-between px-6 ${isEditing && imageUrl ? 'absolute bottom-0 left-0 right-0 pb-4' : 'pt-6 pb-4 border-b border-[#222]'}`}>
            <div>
              <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Propiedad' : 'Nueva Propiedad'}</h2>
              {isEditing && <p className="text-xs text-[#999] mt-0.5">ID: {property?.id_property} • Sincronizado con WASI</p>}
            </div>
            <button onClick={onClose} className="text-[#666] hover:text-white transition-colors p-2 bg-black/30 rounded-lg backdrop-blur-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#222] px-6 gap-1">
          {tabs.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#4A8BC2] text-[#4A8BC2]'
                  : 'border-transparent text-[#666] hover:text-white'
              }`}>
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Messages */}
          <div className="px-6 pt-4">
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
            {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm mb-4">{success}</div>}
          </div>

          <div className="px-6 pb-6 space-y-5 min-h-[320px]">
            {/* ─── TAB: INFO ─── */}
            {activeTab === 'info' && (
              <>
                <div>
                  <label className={labelClass}>Título del inmueble</label>
                  <input name="title" value={form.title} onChange={handleChange} required className={inputClass + ' text-base'} placeholder="Ej: Hermoso apartamento en Laureles" />
                </div>

                {/* Business type — exclusive 3-option segmented control */}
                <div>
                  <label className={labelClass}>Tipo de negocio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { mode: 'sale', label: 'En Venta', activeClass: 'border-[#4A8BC2] bg-[#4A8BC2]/10 text-[#4A8BC2]' },
                      { mode: 'rent', label: 'En Arriendo', activeClass: 'border-green-500 bg-green-500/10 text-green-400' },
                      { mode: 'both', label: 'Venta + Arriendo', activeClass: 'border-amber-500 bg-amber-500/10 text-amber-400' },
                    ] as const).map(opt => (
                      <button
                        key={opt.mode}
                        type="button"
                        onClick={() => setBusinessMode(opt.mode)}
                        className={`py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          businessMode === opt.mode ? opt.activeClass : 'border-[#333] bg-[#111] text-[#666] hover:border-[#444]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prices with formatted display */}
                <div className="grid grid-cols-2 gap-4">
                  {form.for_sale && (
                    <div>
                      <label className={labelClass}>Precio venta</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A8BC2] text-sm font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={salePriceDisplay}
                          onChange={(e) => handlePriceChange('sale_price', e.target.value)}
                          className={inputClass + ' pl-7 text-base font-semibold'}
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-xs">COP</span>
                      </div>
                    </div>
                  )}
                  {form.for_rent && (
                    <div>
                      <label className={labelClass}>Canon mensual</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 text-sm font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={rentPriceDisplay}
                          onChange={(e) => handlePriceChange('rent_price', e.target.value)}
                          className={inputClass + ' pl-7 text-base font-semibold'}
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-xs">COP/mes</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Property type + condition */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Tipo de inmueble</label>
                    <select name="id_property_type" value={form.id_property_type} onChange={handleChange} className={inputClass}>
                      {propertyTypes.map(pt => (
                        <option key={pt.id_property_type} value={pt.id_property_type}>{pt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Condición</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { v: 2, l: 'Usado' },
                        { v: 1, l: 'Nuevo' },
                        { v: 3, l: 'Proyecto' },
                        { v: 4, l: 'En construcción' },
                      ].map(opt => (
                        <button key={opt.v} type="button"
                          onClick={() => setForm(prev => ({ ...prev, id_property_condition: opt.v }))}
                          className={`py-2.5 rounded-lg text-xs font-medium transition-all ${
                            form.id_property_condition === opt.v
                              ? 'bg-[#4A8BC2]/20 border border-[#4A8BC2]/50 text-[#4A8BC2]'
                              : 'bg-[#111] border border-[#333] text-[#888] hover:border-[#444]'
                          }`}>{opt.l}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ─── TAB: SPECS ─── */}
            {activeTab === 'specs' && (
              <>
                <SectionHeader
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                  title="Espacios"
                />
                <div className="flex justify-around py-2">
                  <CounterInput label="Habitaciones" icon="🛏" value={form.bedrooms} onChange={v => setForm(prev => ({ ...prev, bedrooms: v }))} />
                  <CounterInput label="Baños" icon="🚿" value={form.bathrooms} onChange={v => setForm(prev => ({ ...prev, bathrooms: v }))} />
                  <CounterInput label="Garajes" icon="🚗" value={form.garages} onChange={v => setForm(prev => ({ ...prev, garages: v }))} />
                  <CounterInput label="Estrato" icon="⭐" value={form.stratum} onChange={v => setForm(prev => ({ ...prev, stratum: v }))} max={6} />
                </div>

                <SectionHeader
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>}
                  title="Áreas y dimensiones"
                />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Área total</label>
                    <div className="relative">
                      <input type="number" name="area" value={form.area || ''} onChange={(e) => setForm(prev => ({ ...prev, area: Number(e.target.value) || 0 }))} min={0} className={inputClass + ' pr-10'} placeholder="0" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-xs">m²</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Área construida</label>
                    <div className="relative">
                      <input type="number" name="built_area" value={form.built_area || ''} onChange={(e) => setForm(prev => ({ ...prev, built_area: Number(e.target.value) || 0 }))} min={0} className={inputClass + ' pr-10'} placeholder="0" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-xs">m²</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Área privada</label>
                    <div className="relative">
                      <input type="number" name="private_area" value={form.private_area || ''} onChange={(e) => setForm(prev => ({ ...prev, private_area: Number(e.target.value) || 0 }))} min={0} className={inputClass + ' pr-10'} placeholder="0" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-xs">m²</span>
                    </div>
                  </div>
                </div>

                <SectionHeader
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  title="Extras"
                />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Piso</label>
                    <input type="number" name="floor" value={form.floor || ''} onChange={(e) => setForm(prev => ({ ...prev, floor: Number(e.target.value) || 0 }))} min={0} className={inputClass} placeholder="0" />
                  </div>
                  <div>
                    <label className={labelClass}>Año construcción</label>
                    <input
                      type="number"
                      name="year_built"
                      value={form.year_built || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, year_built: Number(e.target.value) || 0 }))}
                      min={1900}
                      max={new Date().getFullYear() + 5}
                      className={inputClass}
                      placeholder="Ej: 2018"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Cuota admin.</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A8BC2] text-xs font-bold">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={feeDisplay}
                        onChange={(e) => handlePriceChange('maintenance_fee', e.target.value)}
                        className={inputClass + ' pl-7'}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ─── TAB: FEATURES (Comodidades) ─── */}
            {activeTab === 'features' && (
              <>
                <SectionHeader
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>}
                  title="Características internas"
                />
                {featureCatalog.internal.length === 0 ? (
                  <p className="text-xs text-[#666] italic">Cargando comodidades...</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {featureCatalog.internal.map(f => {
                      const checked = (form.internal_features as number[]).includes(f.id);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleFeature('internal_features', f.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-left transition-all ${
                            checked
                              ? 'border-[#4A8BC2] bg-[#4A8BC2]/10 text-white'
                              : 'border-[#222] bg-[#111] text-[#888] hover:border-[#333]'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? 'border-[#4A8BC2] bg-[#4A8BC2]' : 'border-[#444]'}`}>
                            {checked && (
                              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            )}
                          </span>
                          <span className="truncate">{f.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <SectionHeader
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                  title="Características externas"
                />
                {featureCatalog.external.length === 0 ? (
                  <p className="text-xs text-[#666] italic">Cargando comodidades...</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {featureCatalog.external.map(f => {
                      const checked = (form.external_features as number[]).includes(f.id);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleFeature('external_features', f.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-left transition-all ${
                            checked
                              ? 'border-green-500 bg-green-500/10 text-white'
                              : 'border-[#222] bg-[#111] text-[#888] hover:border-[#333]'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? 'border-green-500 bg-green-500' : 'border-[#444]'}`}>
                            {checked && (
                              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            )}
                          </span>
                          <span className="truncate">{f.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <p className="text-[10px] text-[#555] pt-2">
                  Seleccionadas: {(form.internal_features as number[]).length} internas, {(form.external_features as number[]).length} externas
                </p>
              </>
            )}

            {/* ─── TAB: LOCATION ─── */}
            {activeTab === 'location' && (
              <>
                <SectionHeader
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>}
                  title="Ubicación del inmueble"
                />
                <div className="space-y-4">
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
                      <label className={labelClass}>Zona / Barrio</label>
                      <select name="id_zone" value={form.id_zone} onChange={handleChange} className={inputClass}>
                        <option value={0}>Seleccionar...</option>
                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Dirección exacta</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      <input name="address" value={form.address} onChange={handleChange} className={inputClass + ' pl-9'} placeholder="Ej: Cra 76 #35-20, Laureles" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ─── TAB: DETAILS ─── */}
            {activeTab === 'details' && (
              <>
                <SectionHeader
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  title="Descripción"
                />
                <div>
                  <textarea
                    name="observations"
                    value={form.observations}
                    onChange={handleChange}
                    rows={6}
                    className={inputClass + ' resize-none leading-relaxed'}
                    placeholder="Describe las cualidades del inmueble, acabados, vistas, amenidades..."
                  />
                  <p className="text-[10px] text-[#555] mt-1">{form.observations.length} caracteres</p>
                </div>

                {/* Image Upload */}
                <SectionHeader
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  title={isEditing ? 'Galería de fotos' : 'Fotos del inmueble'}
                />
                {isEditing && property ? (
                  <ImageUploader propertyId={property.id_property} onUploaded={() => {}} />
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        capture="environment"
                        onChange={handleQueuePhotos}
                        disabled={saving}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                        id="image-queue"
                      />
                      <label
                        htmlFor="image-queue"
                        className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-[#333] hover:border-[#4A8BC2]/40 bg-[#111] hover:bg-[#4A8BC2]/5 cursor-pointer transition-all"
                      >
                        <svg className="w-8 h-8 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-xs text-[#888]">Agregar fotos a la cola</span>
                        <span className="text-[10px] text-[#555]">Se subirán automáticamente al crear la propiedad</span>
                      </label>
                    </div>

                    {pendingPhotos.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {pendingPhotos.map((p, idx) => (
                          <div key={p.id} className="relative group aspect-square rounded-lg overflow-hidden border border-[#333]">
                            <img src={p.preview} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeQueuedPhoto(p.id)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Quitar"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/60 px-1 rounded">#{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {pendingPhotos.length > 0 && (
                      <p className="text-[10px] text-[#888]">
                        {pendingPhotos.length} foto{pendingPhotos.length === 1 ? '' : 's'} en cola · se subirán después de guardar
                      </p>
                    )}

                    {uploadProgress && (
                      <div className="flex items-center gap-2 text-xs text-[#4A8BC2]">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                        {uploadProgress}
                      </div>
                    )}
                  </div>
                )}

                <SectionHeader
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  title="Configuración"
                />
                <div>
                  <label className={labelClass}>Estado en página web</label>
                  <div className="flex gap-2">
                    {[
                      { v: 1, l: 'Activo', color: 'green' },
                      { v: 2, l: 'Inactivo', color: 'gray' },
                      { v: 3, l: 'Destacado', color: 'amber' },
                    ].map(opt => (
                      <button key={opt.v} type="button"
                        onClick={() => setForm(prev => ({ ...prev, id_status_on_page: opt.v }))}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          form.id_status_on_page === opt.v
                            ? opt.color === 'green' ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                              : opt.color === 'amber' ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                              : 'bg-gray-500/20 border border-gray-500/50 text-gray-400'
                            : 'bg-[#111] border border-[#333] text-[#888] hover:border-[#444]'
                        }`}>
                        {opt.v === 1 && '🟢 '}{opt.v === 2 && '⚫ '}{opt.v === 3 && '⭐ '}{opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions — always visible */}
          <div className="flex gap-3 px-6 py-4 border-t border-[#222] bg-[#151515] rounded-b-2xl">
            <button type="button" onClick={onClose} className="flex-1 bg-[#222] hover:bg-[#333] text-white py-3 rounded-xl text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-[2] bg-[#4A8BC2] hover:bg-[#b89952] disabled:opacity-50 text-black py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
              {saving ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Guardando...</>
              ) : isEditing ? (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Guardar cambios</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Crear propiedad</>
              )}
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
    // Prefer url_original (raw photo) — url_big/url letterbox portrait shots.
    return img?.url_original || img?.url_big || img?.url || '';
  };

  const handleCopyLink = (propertyId: number) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://indubienes.com';
    const link = `${baseUrl}/propiedad/${propertyId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(propertyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeactivate = async (prop: Property) => {
    if (!confirm(`¿Desactivar "${prop.title}"?\nSe marcará como "Inactivo" en WASI (no se mostrará en la web).`)) return;
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
          <div className="h-1 w-16 bg-[#4A8BC2] rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm text-[#888] hidden sm:block">
            <p>Total: {totalProperties}</p>
            <p className="text-xs mt-1">Mostrando {filteredProperties.length}</p>
          </div>
          <button
            onClick={() => { setEditingProperty(null); setShowForm(true); }}
            className="bg-[#4A8BC2] hover:bg-[#b89952] text-black font-bold px-5 py-3 rounded-xl text-sm transition-colors flex items-center gap-2"
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
          className="flex-1 bg-[#1a1a1a] border border-[#222] rounded-lg px-4 py-3 text-white placeholder:text-[#555] focus:outline-none focus:border-[#4A8BC2]/50 transition-colors"
        />
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value as 'all' | 'sale' | 'rent'); setCurrentPage(1); }}
          className="bg-[#1a1a1a] border border-[#222] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4A8BC2]/50 transition-colors cursor-pointer"
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
                <div key={property.id_property} className="bg-[#1a1a1a] border border-[#222] rounded-xl overflow-hidden hover:border-[#4A8BC2]/30 transition-all group">
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
                      <span className={`text-xs font-bold px-2 py-1 rounded ${isSale ? 'bg-[#4A8BC2] text-black' : 'bg-green-500/80 text-white'}`}>
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
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-[#4A8BC2] transition-colors">{property.title}</h3>
                      <p className="text-xs text-[#888] mt-1 truncate">{location}</p>
                    </div>
                    <div className="flex gap-3 text-xs text-[#888]">
                      {property.bedrooms > 0 && <span>{property.bedrooms} hab</span>}
                      {property.bathrooms > 0 && <span>{property.bathrooms} baños</span>}
                      {property.area > 0 && <span>{property.area} m²</span>}
                      {property.garages > 0 && <span>{property.garages} gar</span>}
                    </div>
                    <div className="pt-2 border-t border-[#222]">
                      <p className="text-lg font-bold text-[#4A8BC2]">{price}</p>
                    </div>

                    {/* CRUD Actions */}
                    <div className="grid grid-cols-4 gap-1.5 pt-2">
                      <button onClick={() => handleEdit(property)} className="bg-[#222] hover:bg-blue-500/20 text-blue-400 text-xs py-2 rounded transition-colors flex items-center justify-center" title="Editar">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleCopyLink(property.id_property)} className="bg-[#222] hover:bg-[#4A8BC2]/20 text-[#4A8BC2] text-xs py-2 rounded transition-colors flex items-center justify-center" title="Copiar link">
                        {copiedId === property.id_property ? (
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        )}
                      </button>
                      <a href={`/propiedad/${property.id_property}`} target="_blank" rel="noopener noreferrer" className="bg-[#222] hover:bg-[#4A8BC2]/20 text-[#4A8BC2] text-xs py-2 rounded transition-colors flex items-center justify-center" title="Ver">
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
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-[#1a1a1a] border border-[#222] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#4A8BC2]/30 transition-colors">
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
                <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-10 h-10 rounded-lg transition-colors ${currentPage === pageNum ? 'bg-[#4A8BC2] text-black font-bold' : 'bg-[#1a1a1a] border border-[#222] text-white hover:border-[#4A8BC2]/30'}`}>
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-[#1a1a1a] border border-[#222] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#4A8BC2]/30 transition-colors">
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
          onCreated={async (newId) => {
            // After creation, fetch the new property and reopen editor so user can upload photos
            try {
              const res = await fetch(`/api/properties/${newId}`);
              const data = await res.json();
              if (data && data.id_property) {
                setTimeout(() => {
                  setEditingProperty(data);
                  setShowForm(true);
                }, 300);
              }
            } catch {
              // Fallback: just reopen with minimal data so user can upload
              setTimeout(() => {
                setEditingProperty({ id_property: newId, title: '', sale_price: 0, rent_price: 0, bedrooms: 0, bathrooms: 0, area: 0, garages: 0 } as Property);
                setShowForm(true);
              }, 300);
            }
          }}
        />
      )}
    </div>
  );
}
