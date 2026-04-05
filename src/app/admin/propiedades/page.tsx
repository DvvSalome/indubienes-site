'use client';

import { useState, useEffect } from 'react';

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
}

export default function PropiedadesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'rent'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const itemsPerPage = 12;

  useEffect(() => {
    fetchProperties();
  }, [currentPage, filterType]);

  const fetchProperties = async () => {
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
  };

  const filteredProperties = properties.filter((prop) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const location = prop.location_label || prop.zone_label || prop.city_label || '';
    return (
      (prop.title || '').toLowerCase().includes(search) ||
      location.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(totalProperties / itemsPerPage);

  const handleCopyLink = (propertyId: number) => {
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://indubienes.com';
    const link = `${baseUrl}/p/${propertyId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(propertyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatPrice = (price: number) => {
    if (!price) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Propiedades
          </h1>
          <div className="h-1 w-16 bg-[#C9A962] rounded-full" />
        </div>
        <div className="text-right text-sm text-[#888]">
          <p>Total de propiedades: {totalProperties}</p>
          <p className="text-xs mt-1">Mostrando {filteredProperties.length}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Buscar por título o ubicación..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 bg-[#1a1a1a] border border-[#222] rounded-lg px-4 py-3 text-white placeholder:text-[#555] focus:outline-none focus:border-[#C9A962]/50 transition-colors"
          />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as 'all' | 'sale' | 'rent');
              setCurrentPage(1);
            }}
            className="bg-[#1a1a1a] border border-[#222] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C9A962]/50 transition-colors cursor-pointer"
          >
            <option value="all">Todas las propiedades</option>
            <option value="sale">En venta</option>
            <option value="rent">En alquiler</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#1a1a1a] border border-[#222] rounded-xl overflow-hidden animate-pulse"
              >
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
              const imageUrl = property.main_image?.url_original || property.main_image?.url_big || property.main_image?.url;
              const isSale = property.for_sale || property.sale_price > 0;
              const price = isSale
                ? (property.sale_price_label || formatPrice(property.sale_price))
                : (property.rent_price_label || formatPrice(property.rent_price));
              const location = property.location_label || `${property.zone_label || ''}, ${property.city_label || ''}`;

              return (
                <div
                  key={property.id_property}
                  className="bg-[#1a1a1a] border border-[#222] rounded-xl overflow-hidden hover:border-[#C9A962]/30 transition-all group"
                >
                  {/* Image */}
                  <div className="relative h-40 bg-[#222] overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Status badge */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${isSale ? 'bg-[#C9A962] text-black' : 'bg-green-500/80 text-white'}`}>
                        {isSale ? 'Venta' : 'Arriendo'}
                      </span>
                      {property.property_type_label && (
                        <span className="text-xs px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-white">
                          {property.property_type_label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-[#C9A962] transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-xs text-[#888] mt-1 truncate">{location}</p>
                    </div>

                    {/* Details */}
                    <div className="flex gap-3 text-xs text-[#888]">
                      {property.bedrooms > 0 && <span>{property.bedrooms} hab</span>}
                      {property.bathrooms > 0 && <span>{property.bathrooms} baños</span>}
                      {property.area > 0 && <span>{property.area} m²</span>}
                      {property.garages > 0 && <span>{property.garages} gar</span>}
                    </div>

                    {/* Price */}
                    <div className="pt-2 border-t border-[#222]">
                      <p className="text-lg font-bold text-[#C9A962]">
                        {price}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleCopyLink(property.id_property)}
                        className="flex-1 bg-[#222] hover:bg-[#C9A962]/20 text-[#C9A962] text-xs font-medium py-2 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        {copiedId === property.id_property ? (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Copiado
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Link
                          </>
                        )}
                      </button>
                      <a
                        href={`/propiedad/${property.id_property}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#C9A962]/10 hover:bg-[#C9A962]/20 text-[#C9A962] text-xs font-medium py-2 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ver
                      </a>
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
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[#1a1a1a] border border-[#222] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#C9A962]/30 transition-colors"
          >
            Anterior
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg transition-colors ${
                  currentPage === i + 1
                    ? 'bg-[#C9A962] text-black font-bold'
                    : 'bg-[#1a1a1a] border border-[#222] text-white hover:border-[#C9A962]/30'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-[#1a1a1a] border border-[#222] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#C9A962]/30 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
