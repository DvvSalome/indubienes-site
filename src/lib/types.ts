export interface PropertyImage {
  url: string;
  url_big: string;
  url_original: string;
}

export interface PropertyGallery {
  id_gallery: number;
  title: string;
  images: PropertyImage[];
}

export interface Property {
  id_property: number;
  title: string;
  address: string;
  area: number;
  built_area: number;
  sale_price: number;
  sale_price_label: string;
  rent_price: number;
  rent_price_label: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  floor: number;
  country_label: string;
  region_label: string;
  city_label: string;
  zone_label: string;
  location_label: string;
  main_image: PropertyImage;
  galleries: PropertyGallery[];
  features: {
    internal: string[];
    external: string[];
  };
  latitude: number;
  longitude: number;
  for_sale: boolean;
  for_rent: boolean;
  observations: string;
  video: string;
  url_360: string;
  id_property_type: number;
  property_type_label: string;
  stratum: number;
  maintenance_fee: number;
  maintenance_fee_label: string;
  property_condition_label: string;
  visits: number;
  built_area: number;
  private_area: number;
  reference: string;
}

export interface PropertySearchFilters {
  for_sale?: boolean;
  for_rent?: boolean;
  id_property_type?: number;
  id_city?: number;
  id_zone?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  bathrooms?: number;
  garages?: number;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  skip?: number;
  take?: number;
  order?: string;
  order_by?: string;
}

export interface PropertySearchResult {
  properties: Property[];
  total: number;
}

export interface PropertyType {
  id_property_type: number;
  name: string;
  count: number;
}

export interface WasiClient {
  id_client: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  cell_phone: string | null;
  client_type_label: string;
  client_types: { id_client_type: number; client_type_label: string }[];
  client_status_label: string;
  client_pipeline_label: string;
  client_origin_label: string;
  city_label: string;
  region_label: string;
  country_label: string;
  reference: string;
  comment: string | null;
  query: string | null;
  address: string | null;
  identification: string | null;
  created_at: string;
  updated_at: string;
  tag: string[];
}

export interface WasiClientSearchResult {
  clients: WasiClient[];
  total: number;
}

export interface WasiClientSearchFilters {
  skip?: number;
  take?: number;
  order_by?: string;
  order?: string;
  id_client_status?: number;
  id_client_type?: number;
  query?: string;
}
