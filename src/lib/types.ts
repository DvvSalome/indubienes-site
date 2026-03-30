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
  id_property_type: number;
  property_type_label: string;
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
