import { Property, PropertySearchFilters, PropertySearchResult, PropertyType } from './types';
import { mockProperties, mockPropertyTypes } from './mock-data';

const WASI_BASE_URL = 'https://api.wasi.co/v1';
const WASI_COMPANY_ID = '1288465';
const WASI_TOKEN = '***REDACTED***';

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

    // Check for WASI-specific auth errors
    if (data?.status === 'error' || data?.error) {
      console.error('WASI API returned error:', data);
      return null;
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

// Get featured/highlighted properties
export async function getHighlightedProperties(): Promise<Property[]> {
  const result = await wasiRequest<Record<string, Property>>('/property/highlighted/', {
    params: { for_sale: 'true' },
  });

  if (result) {
    // WASI returns properties at top level with numeric keys: {"total": N, "0": {...}, "1": {...}}
    const properties = Object.entries(result)
      .filter(([key]) => !isNaN(Number(key)))
      .map(([, value]) => normalizeProperty(value))
      .slice(0, 6);

    if (properties.length > 0) {
      return properties;
    }
  }

  // Fallback
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
      .map(([, value]) => value as PropertyType);
  }

  return mockPropertyTypes;
}

// Normalize property data from WASI API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProperty(raw: any): Property {
  return {
    id_property: raw.id_property || 0,
    title: raw.title || '',
    address: raw.address || '',
    area: Number(raw.area) || 0,
    built_area: Number(raw.built_area) || 0,
    sale_price: Number(raw.sale_price) || 0,
    sale_price_label: raw.sale_price_label || (raw.sale_price ? formatPrice(Number(raw.sale_price)) : ''),
    rent_price: Number(raw.rent_price) || 0,
    rent_price_label: raw.rent_price_label || (raw.rent_price ? formatPrice(Number(raw.rent_price)) : ''),
    bedrooms: Number(raw.bedrooms) || 0,
    bathrooms: Number(raw.bathrooms) || 0,
    garages: Number(raw.garages) || 0,
    floor: Number(raw.floor) || 0,
    country_label: raw.country_label || 'Colombia',
    region_label: raw.region_label || 'Antioquia',
    city_label: raw.city_label || '',
    zone_label: raw.zone_label || '',
    location_label: raw.location_label || '',
    main_image: raw.main_image || {
      url: '/placeholder-property.jpg',
      url_big: '/placeholder-property.jpg',
      url_original: '/placeholder-property.jpg',
    },
    galleries: raw.galleries || [],
    features: raw.features || { internal: [], external: [] },
    latitude: Number(raw.latitude) || 0,
    longitude: Number(raw.longitude) || 0,
    for_sale: Boolean(raw.for_sale),
    for_rent: Boolean(raw.for_rent),
    observations: raw.observations || '',
    video: raw.video || '',
    id_property_type: Number(raw.id_property_type) || 0,
    property_type_label: raw.property_type_label || raw.id_property_type_label || '',
  };
}
