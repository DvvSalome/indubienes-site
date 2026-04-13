import { Property, PropertySearchFilters, PropertySearchResult, PropertyType, PropertyFeatureGroup, WasiClient, WasiClientSearchFilters, WasiClientSearchResult } from './types';
import { mockProperties, mockPropertyTypes } from './mock-data';

const WASI_BASE_URL = 'https://api.wasi.co/v1';
// Trim to defend against trailing whitespace/newlines when env vars are pasted
// into dashboards (Vercel, etc.). WASI rejects tokens with whitespace silently.
const WASI_COMPANY_ID = (process.env.WASI_COMPANY_ID || '').trim();
const WASI_TOKEN = (process.env.WASI_TOKEN || '').trim();

interface WasiRequestOptions {
  method?: 'GET' | 'POST';
  body?: Record<string, unknown>;
  params?: Record<string, string>;
}

async function wasiRequest<T>(endpoint: string, options: WasiRequestOptions = {}): Promise<T | null> {
  const { method = 'GET', body, params } = options;

  try {
    let url = `${WASI_BASE_URL}${endpoint}`;

    const queryParams = new URLSearchParams({
      id_company: WASI_COMPANY_ID,
      wasi_token: WASI_TOKEN,
      ...params,
    });

    if (method === 'GET') {
      url += `?${queryParams.toString()}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data from WASI
    };

    if (method === 'POST') {
      fetchOptions.body = JSON.stringify({
        id_company: WASI_COMPANY_ID,
        wasi_token: WASI_TOKEN,
        ...body,
      });
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      console.error(`WASI API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Check for WASI-specific errors: return the data so callers can surface the message.
    // Callers that rely on presence of `id_property` / numeric keys still work because
    // error responses don't contain those fields.
    if (data?.status === 'error' || data?.error) {
      console.error('WASI API returned error:', data);
      return data as T;
    }

    return data as T;
  } catch (error) {
    console.error('WASI API request failed:', error);
    return null;
  }
}

// Format price for Colombian pesos
export function formatPrice(price: number): string {
  if (!price) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Search properties
export async function searchProperties(filters: PropertySearchFilters = {}): Promise<PropertySearchResult> {
  const { skip = 0, take = 12, ...rest } = filters;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await wasiRequest<Record<string, any>>('/property/search', {
    method: 'POST',
    body: {
      ...rest,
      skip,
      take,
      order_by: 'created_at',
      order: 'desc',
    },
  });

  if (result) {
    // WASI returns properties at top level with numeric keys: {"total": N, "0": {...}, "1": {...}, "status": "success"}
    const total = Number(result.total) || 0;
    const properties = Object.entries(result)
      .filter(([key]) => !isNaN(Number(key)))
      .map(([, value]) => normalizeProperty(value));

    if (properties.length > 0) {
      return { properties, total };
    }
  }

  // Fallback to mock data
  console.log('Using mock property data');
  let filtered = [...mockProperties];

  if (rest.for_sale !== undefined) {
    filtered = filtered.filter(p => p.for_sale === rest.for_sale);
  }
  if (rest.for_rent !== undefined) {
    filtered = filtered.filter(p => p.for_rent === rest.for_rent);
  }
  if (rest.id_property_type) {
    filtered = filtered.filter(p => p.id_property_type === rest.id_property_type);
  }
  if (rest.min_bedrooms) {
    filtered = filtered.filter(p => p.bedrooms >= (rest.min_bedrooms || 0));
  }
  if (rest.bathrooms) {
    filtered = filtered.filter(p => p.bathrooms >= (rest.bathrooms || 0));
  }
  if (rest.min_price) {
    filtered = filtered.filter(p => (p.sale_price || p.rent_price) >= (rest.min_price || 0));
  }
  if (rest.max_price) {
    filtered = filtered.filter(p => (p.sale_price || p.rent_price) <= (rest.max_price || Infinity));
  }

  return {
    properties: filtered.slice(skip, skip + take),
    total: filtered.length,
  };
}

// Read admin-curated featured IDs from GitHub Gist (no rebuild trigger)
async function getFeaturedIds(): Promise<number[]> {
  try {
    const res = await fetch(
      'https://api.github.com/gists/0219a824e7e5307a50d318fa08dc5e3e',
      {
        headers: { Authorization: `token ${process.env.GITHUB_TOKEN || ''}` },
        cache: 'no-store',
      }
    );
    if (!res.ok) return [];
    const gist = await res.json();
    const raw = gist.files?.['featured-ids.json']?.content;
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data.ids) ? data.ids.filter((id: number) => id > 0) : [];
  } catch {
    return [];
  }
}

// Get featured/highlighted properties
// Priority: admin-curated IDs > WASI highlighted > fallback mock
export async function getHighlightedProperties(): Promise<Property[]> {
  // 1. Check if admin has curated specific properties
  const featuredIds = await getFeaturedIds();

  if (featuredIds.length > 0) {
    // Fetch each property by ID from WASI
    const fetched = await Promise.all(
      featuredIds.slice(0, 9).map(id => getProperty(id))
    );
    const valid = fetched.filter((p): p is Property => p !== null);
    if (valid.length > 0) return valid;
  }

  // 2. Fallback: WASI highlighted endpoint
  const result = await wasiRequest<Record<string, Property>>('/property/highlighted/', {
    params: { for_sale: 'true' },
  });

  if (result) {
    const properties = Object.entries(result)
      .filter(([key]) => !isNaN(Number(key)))
      .map(([, value]) => normalizeProperty(value))
      .slice(0, 6);

    if (properties.length > 0) {
      return properties;
    }
  }

  // 3. Last fallback
  return mockProperties.slice(0, 4);
}

// Get single property
export async function getProperty(id: number): Promise<Property | null> {
  const result = await wasiRequest<Property>(`/property/get/${id}`);

  if (result && result.id_property) {
    return normalizeProperty(result);
  }

  // Fallback
  return mockProperties.find(p => p.id_property === id) || null;
}

// Get property types
export async function getPropertyTypes(): Promise<PropertyType[]> {
  const result = await wasiRequest<Record<string, PropertyType>>('/property-type/all');

  if (result) {
    // WASI returns property types with numeric keys + "status" key - filter out non-numeric
    return Object.entries(result)
      .filter(([key]) => !isNaN(Number(key)))
      .map(([, value]) => value as PropertyType)
      .filter(pt => {
        // Filter out encoded/raw translation keys like "models/property_type.id.34"
        if (!pt.name || pt.name.startsWith('models/') || pt.name.includes('.id.')) return false;
        return true;
      });
  }

  return mockPropertyTypes;
}

// Get all available internal/external property features from WASI.
// Endpoint: GET /v1/feature/all — returns { internal: [{id, nombre, name, own}], external: [...] }
export async function getFeatures(): Promise<PropertyFeatureGroup> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await wasiRequest<Record<string, any>>('/feature/all');
  if (!result) return { internal: [], external: [] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapList = (arr: any): { id: number; name: string }[] => {
    if (!arr) return [];
    const items = Array.isArray(arr) ? arr : Object.values(arr);
    return items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => ({
        id: Number(item?.id || item?.id_feature || 0),
        name: String(item?.nombre || item?.name || '').trim(),
      }))
      .filter((f) => f.id > 0 && f.name.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  };

  return {
    internal: mapList(result.internal || result.internals),
    external: mapList(result.external || result.externals),
  };
}

// WASI returns booleans as strings "true"/"false", numbers 0/1, or actual booleans
// Boolean("false") === true in JS, so we need explicit parsing
function parseBool(val: unknown): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  if (typeof val === 'string') return val === 'true' || val === '1';
  return false;
}

// WASI sometimes returns objects like {id, nombre, name, own} instead of plain strings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractLabel(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.nombre || val.name || val.label || String(val.id || '');
  return String(val);
}

// WASI features can be objects {id, nombre, name} or strings — normalize to string[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFeatures(raw: any): { internal: string[]; external: string[] } {
  const normalize = (arr: unknown): string[] => {
    if (!arr) return [];
    // Could be an array or an object with numeric keys
    const items = Array.isArray(arr) ? arr : Object.values(arr);
    return items.map((item: unknown) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        return String(obj.nombre || obj.name || obj.label || '');
      }
      return String(item || '');
    }).filter(Boolean);
  };

  if (!raw) return { internal: [], external: [] };
  return {
    internal: normalize(raw.internal || raw.internals),
    external: normalize(raw.external || raw.externals),
  };
}

// Extract numeric IDs from WASI feature arrays (used by admin for pre-selection).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractFeatureIds(raw: any): number[] {
  if (!raw) return [];
  const items = Array.isArray(raw) ? raw : Object.values(raw);
  return items
    .map((item: unknown) => {
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        return Number(obj.id || obj.id_feature || 0);
      }
      return Number(item) || 0;
    })
    .filter((n) => n > 0);
}

/**
 * Normalize WASI image object.
 *
 * History: previously WASI's `url_original` returned a tiny 100x90 thumbnail and we
 * worked around it by deriving a "g"-prefixed filename URL. WASI has since fixed
 * `url_original` to return the true raw photo (e.g. 960x1280). The old workaround
 * now produces the OPPOSITE bug: the "g"-prefixed URL returns a 979x734 image that
 * WASI has pre-processed with `fit:contain` and a white background — i.e. portrait
 * photos arrive with white letterboxing already baked into the pixels.
 *
 * `url` and `url_big` are the image.wasi.co resize tokens; decoding their base64
 * shows `"fit":"contain","background":{"r":255,"g":255,"b":255}`, so they also
 * letterbox. We only use them as a last resort.
 *
 * Trust order: url_original (raw, no letterbox) → raw-filename URL → url_big → url
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fixImageObject(img: any): { url: string; url_big: string; url_original: string } {
  if (!img) return { url: '/placeholder-property.jpg', url_big: '/placeholder-property.jpg', url_original: '/placeholder-property.jpg' };

  // Prefer WASI's raw url_original if present. Never "g"-prefix — that returns the
  // pre-letterboxed 979x734 processed image, which is exactly the bug we're fixing.
  let urlOriginal = typeof img.url_original === 'string' ? img.url_original.trim() : '';

  // Fall back to deriving the raw URL from the filename (NO "g" prefix).
  if (!urlOriginal) {
    const filename = typeof img.filename === 'string' ? img.filename : '';
    if (filename) {
      const rawName = filename.startsWith('g') ? filename.slice(1) : filename;
      urlOriginal = `https://images.wasi.co/inmuebles/${rawName}`;
    }
  }

  // Last resort: the base64 resize-token URLs (they letterbox, but better than nothing).
  if (!urlOriginal) urlOriginal = img.url_big || img.url || '';

  return {
    url: img.url || '',
    url_big: img.url_big || '',
    url_original: urlOriginal,
  };
}

// Normalize property data from WASI API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProperty(raw: any): Property {
  return {
    id_property: raw.id_property || 0,
    title: extractLabel(raw.title),
    address: extractLabel(raw.address),
    area: Number(raw.area) || 0,
    built_area: Number(raw.built_area) || 0,
    sale_price: Number(raw.sale_price) || 0,
    sale_price_label: extractLabel(raw.sale_price_label) || (raw.sale_price ? formatPrice(Number(raw.sale_price)) : ''),
    rent_price: Number(raw.rent_price) || 0,
    rent_price_label: extractLabel(raw.rent_price_label) || (raw.rent_price ? formatPrice(Number(raw.rent_price)) : ''),
    bedrooms: Number(raw.bedrooms) || 0,
    bathrooms: Number(raw.bathrooms) || 0,
    garages: Number(raw.garages) || 0,
    floor: Number(raw.floor) || 0,
    country_label: extractLabel(raw.country_label) || 'Colombia',
    region_label: extractLabel(raw.region_label) || 'Antioquia',
    city_label: extractLabel(raw.city_label),
    zone_label: extractLabel(raw.zone_label),
    location_label: extractLabel(raw.location_label),
    main_image: fixImageObject(raw.main_image || raw.image),
    galleries: normalizeGalleries(raw.galleries),
    features: normalizeFeatures(raw.features),
    internal_feature_ids: extractFeatureIds(raw?.features?.internal ?? raw?.features?.internals),
    external_feature_ids: extractFeatureIds(raw?.features?.external ?? raw?.features?.externals),
    latitude: Number(raw.latitude) || 0,
    longitude: Number(raw.longitude) || 0,
    for_sale: parseBool(raw.for_sale),
    for_rent: parseBool(raw.for_rent),
    observations: raw.observations || '',
    video: raw.video || '',
    url_360: raw.url_360 || '',
    id_property_type: Number(raw.id_property_type) || 0,
    property_type_label: extractLabel(raw.property_type_label) || extractLabel(raw.id_property_type_label),
    stratum: Number(raw.stratum) || 0,
    year_built: Number(raw.building_date) || Number(raw.year_built) || 0,
    maintenance_fee: Number(raw.maintenance_fee) || 0,
    maintenance_fee_label: extractLabel(raw.maintenance_fee_label),
    property_condition_label: (() => {
      const lbl = extractLabel(raw.property_condition_label);
      const map: Record<string, string> = { 'New': 'Nuevo', 'Used': 'Usado', 'Remodeled': 'Remodelado', 'Under Construction': 'En construcción' };
      return map[lbl] || lbl;
    })(),
    visits: Number(raw.visits) || 0,
    private_area: Number(raw.private_area) || 0,
    reference: raw.reference || '',
  };
}

// Search WASI clients (leads/contacts)
export async function searchClients(filters: WasiClientSearchFilters = {}): Promise<WasiClientSearchResult> {
  const { skip = 0, take = 10, order_by = 'created_at', order = 'desc', ...rest } = filters;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await wasiRequest<Record<string, any>>('/client/search', {
    method: 'POST',
    body: {
      ...rest,
      skip,
      take,
      order_by,
      order,
    },
  });

  if (result) {
    const total = Number(result.total) || 0;
    const clients = Object.entries(result)
      .filter(([key]) => !isNaN(Number(key)))
      .map(([, value]) => normalizeClient(value));

    return { clients, total };
  }

  return { clients: [], total: 0 };
}

// Get client count summary (total + new this month)
export async function getClientStats(): Promise<{ total: number; newThisMonth: number }> {
  // Get total count
  const allResult = await searchClients({ take: 1 });
  const total = allResult.total;

  // Get new clients this month by searching with a recent date filter
  // WASI doesn't have date filters on client/search, so we fetch recent and count manually
  const recentResult = await searchClients({ take: 50, order_by: 'created_at', order: 'desc' });
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = recentResult.clients.filter(c => {
    const created = new Date(c.created_at);
    return created >= startOfMonth;
  }).length;

  return { total, newThisMonth };
}

// ─── WRITE OPERATIONS ───────────────────────────────────────────────────────

// Create a new property in WASI
export async function createProperty(data: Record<string, unknown>): Promise<{ status: string; id_property?: number; message?: string }> {
  const result = await wasiRequest<Record<string, unknown>>('/property/add', {
    method: 'POST',
    body: { ...data, id_user: 11368 },
  });
  if (result?.status === 'success') {
    return { status: 'success', id_property: Number(result.id_property || 0) };
  }
  return { status: 'error', message: String(result?.message || 'Error al crear propiedad') };
}

/**
 * Upload an image to a property's gallery via WASI's multipart endpoint.
 * WASI endpoint: POST /v1/property/upload-image/{id_property}
 * Content-Type: multipart/form-data
 * Fields: image (file, required), description (string, optional), position (number, optional)
 */
export async function uploadPropertyImage(
  id: number,
  imageBlob: Blob,
  filename = 'photo.jpg',
  options: { description?: string; position?: number } = {}
): Promise<{ status: string; message?: string; id_image?: number }> {
  try {
    const url = `${WASI_BASE_URL}/property/upload-image/${id}?id_company=${WASI_COMPANY_ID}&wasi_token=${WASI_TOKEN}`;
    const formData = new FormData();
    formData.append('image', imageBlob, filename);
    if (options.description) formData.append('description', options.description);
    if (options.position !== undefined) formData.append('position', String(options.position));

    const response = await fetch(url, { method: 'POST', body: formData, cache: 'no-store' });
    const data = await response.json();
    if (data?.status === 'success') {
      return { status: 'success', id_image: Number(data.id_image || data.id || 0) };
    }
    return { status: 'error', message: String(data?.message || 'WASI no pudo procesar la imagen') };
  } catch (error) {
    console.error('WASI image upload failed:', error);
    return { status: 'error', message: 'Error de conexión al subir la imagen' };
  }
}

// Update an existing property in WASI
export async function updateProperty(id: number, data: Record<string, unknown>): Promise<{ status: string; message?: string }> {
  const result = await wasiRequest<Record<string, unknown>>(`/property/update/${id}`, {
    method: 'POST',
    body: data,
  });
  if (result?.status === 'success') {
    return { status: 'success' };
  }
  return { status: 'error', message: String(result?.message || 'Error al actualizar propiedad') };
}

// Add a new client in WASI
export async function createClient(data: Record<string, unknown>): Promise<{ status: string; id_client?: number; message?: string }> {
  const result = await wasiRequest<Record<string, unknown>>('/client/add', {
    method: 'POST',
    body: data,
  });
  if (result?.status === 'success') {
    return { status: 'success', id_client: Number(result.id_client || 0) };
  }
  return { status: 'error', message: String(result?.message || 'Error al crear cliente') };
}

// Update an existing client in WASI
export async function updateClient(id: number, data: Record<string, unknown>): Promise<{ status: string; message?: string }> {
  const result = await wasiRequest<Record<string, unknown>>(`/client/update/${id}`, {
    method: 'POST',
    body: data,
  });
  if (result?.status === 'success') {
    return { status: 'success' };
  }
  return { status: 'error', message: String(result?.message || 'Error al actualizar cliente') };
}

// Get regions for a country from WASI
export async function getRegions(countryId: number = 1): Promise<Array<{ id: number; name: string }>> {
  const result = await wasiRequest<Record<string, unknown>>('/location/regions-by-country', {
    method: 'POST',
    body: { id_country: countryId },
  });
  if (!result) return [];
  return Object.entries(result)
    .filter(([key]) => !isNaN(Number(key)))
    .map(([, val]) => {
      const v = val as Record<string, unknown>;
      return { id: Number(v.id_region || v.id), name: String(v.name || v.label || '') };
    });
}

// Get cities for a region from WASI
export async function getCities(regionId: number): Promise<Array<{ id: number; name: string }>> {
  const result = await wasiRequest<Record<string, unknown>>('/location/cities-by-region', {
    method: 'POST',
    body: { id_region: regionId },
  });
  if (!result) return [];
  return Object.entries(result)
    .filter(([key]) => !isNaN(Number(key)))
    .map(([, val]) => {
      const v = val as Record<string, unknown>;
      return { id: Number(v.id_city || v.id), name: String(v.name || v.label || '') };
    });
}

// Get zones for a city from WASI
export async function getZones(cityId: number): Promise<Array<{ id: number; name: string }>> {
  const result = await wasiRequest<Record<string, unknown>>('/location/zones-by-city', {
    method: 'POST',
    body: { id_city: cityId },
  });
  if (!result) return [];
  return Object.entries(result)
    .filter(([key]) => !isNaN(Number(key)))
    .map(([, val]) => {
      const v = val as Record<string, unknown>;
      return { id: Number(v.id_zone || v.id), name: String(v.name || v.label || '') };
    });
}

// Normalize client data from WASI API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeClient(raw: any): WasiClient {
  return {
    id_client: Number(raw.id_client) || 0,
    first_name: String(raw.first_name || '').trim(),
    last_name: String(raw.last_name || '').trim(),
    email: String(raw.email || ''),
    phone: raw.phone || null,
    cell_phone: raw.cell_phone || null,
    client_type_label: extractLabel(raw.client_type_label),
    client_types: Array.isArray(raw.client_types) ? raw.client_types : [],
    client_status_label: extractLabel(raw.client_status_label),
    client_pipeline_label: extractLabel(raw.client_pipeline_label),
    client_origin_label: extractLabel(raw.client_origin_label),
    city_label: extractLabel(raw.city_label),
    region_label: extractLabel(raw.region_label),
    country_label: extractLabel(raw.country_label),
    reference: String(raw.reference || ''),
    comment: raw.comment || null,
    query: raw.query || null,
    address: raw.address || null,
    identification: raw.identification || null,
    created_at: raw.created_at || '',
    updated_at: raw.updated_at || '',
    tag: Array.isArray(raw.tag) ? raw.tag : [],
  };
}

// WASI galleries come in multiple formats:
// 1. Array of objects with numeric keys for images: [{ id: X, "0": img, "1": img, ... }]
// 2. Object with numeric keys: {"0": {id_gallery, images: {"0": img}}, ...}
// 3. Array with proper images key: [{ id_gallery, images: [img, img] }]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeGalleries(raw: any): Property['galleries'] {
  if (!raw) return [];

  // Convert to array if it's an object with numeric keys
  const galleries: Record<string, unknown>[] = Array.isArray(raw)
    ? raw
    : Object.entries(raw)
        .filter(([key]) => !isNaN(Number(key)))
        .map(([, val]) => val as Record<string, unknown>);

  return galleries.map((g) => {
    // Try to get images from "images" property first
    let images = g.images;

    // If no "images" property, extract from numeric keys on the gallery object itself
    // WASI format: { id: 123, "0": {url, url_big, ...}, "1": {url, ...}, ... }
    if (!images || (typeof images === 'object' && !Array.isArray(images) && Object.keys(images as object).length === 0)) {
      const numericEntries = Object.entries(g)
        .filter(([k]) => !isNaN(Number(k)))
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, v]) => v);
      if (numericEntries.length > 0) {
        images = numericEntries;
      }
    }

    // If images is an object with numeric keys, convert to array
    if (images && !Array.isArray(images) && typeof images === 'object') {
      images = Object.entries(images as Record<string, unknown>)
        .filter(([k]) => !isNaN(Number(k)))
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, v]) => v);
    }

    const imgArray = ((images as unknown[]) || []).map((img: unknown) => fixImageObject(img));
    return {
      id_gallery: Number(g.id_gallery || g.id) || 0,
      title: extractLabel(g.title),
      images: imgArray,
    };
  });
}
