'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Property } from '@/lib/types';
import { formatPrice } from '@/lib/wasi';
import FunnelGallery from './FunnelGallery';
import FunnelForm from './FunnelForm';

interface FunnelClientProps {
  property: Property;
}

export default function FunnelClient({ property }: FunnelClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const price = property.sale_price ? formatPrice(property.sale_price) : formatPrice(property.rent_price);
  const type = property.for_sale ? 'Venta' : 'Arriendo';
  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa esta propiedad: ${property.property_type_label} en ${property.city_label}. ${property.bedrooms} hab, ${property.bathrooms} baños, ${property.area}m². ${price}`
  );

  const scrollToForm = () => {
    const formElement = document.getElementById('lead-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Get UTM parameters
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');

  return (
    <div className="bg-[#0D0D0D] min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-end justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={property.main_image?.url_big || property.main_image?.url || '/placeholder-property.jpg'}
            alt={property.property_type_label}
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/50 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 text-center">
          {/* Property Type Badge */}
          <div className="inline-block bg-[#C9A962] text-[#0D0D0D] px-6 py-2 rounded-full font-semibold text-sm mb-6 hover:bg-[#B8943D] transition">
            {property.property_type_label} en {type}
          </div>

          {/* Price */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#C9A962] mb-6 font-display">
            {price}
          </h1>

          {/* Location */}
          <div className="flex items-center justify-center gap-2 mb-8 text-lg sm:text-xl">
            <svg className="w-6 h-6 text-[#C9A962]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-[#B0B0B0]">
              {property.location_label || property.zone_label}, {property.city_label}
            </span>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-12 max-w-2xl mx-auto">
            {/* Bedrooms */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur rounded-lg p-4">
              <div className="text-[#C9A962] text-2xl font-bold mb-1">{property.bedrooms}</div>
              <div className="text-[#707070] text-sm">Habitaciones</div>
            </div>

            {/* Bathrooms */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur rounded-lg p-4">
              <div className="text-[#C9A962] text-2xl font-bold mb-1">{property.bathrooms}</div>
              <div className="text-[#707070] text-sm">Baños</div>
            </div>

            {/* Area */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur rounded-lg p-4">
              <div className="text-[#C9A962] text-2xl font-bold mb-1">{property.area}</div>
              <div className="text-[#707070] text-sm">m²</div>
            </div>

            {/* Garages */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur rounded-lg p-4">
              <div className="text-[#C9A962] text-2xl font-bold mb-1">{property.garages}</div>
              <div className="text-[#707070] text-sm">Garajes</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/573177597155?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-8 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.6 6.32c-1.63-1.6-3.8-2.48-6.1-2.48-4.76 0-8.63 3.87-8.63 8.63 0 1.52.39 3 1.15 4.31L2.9 21.1l4.54-1.19c1.26.68 2.68 1.04 4.13 1.04 4.76 0 8.63-3.87 8.63-8.63 0-2.3-.95-4.46-2.64-6z" />
              </svg>
              Contactar por WhatsApp
            </a>

            {/* Lead Form Button */}
            <button
              onClick={scrollToForm}
              className="bg-[#C9A962] hover:bg-[#B8943D] text-[#0D0D0D] font-semibold py-4 px-8 rounded-lg transition transform hover:scale-105"
            >
              Solicitar información
            </button>
          </div>

          {/* Scroll Indicator */}
          {!scrolled && (
            <div className="animate-bounce mt-8">
              <svg className="w-6 h-6 mx-auto text-[#C9A962]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-[#0D0D0D] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 font-display">Galería de fotos</h2>
          <FunnelGallery property={property} />
        </div>
      </section>

      {/* Details Section */}
      <section className="bg-[#1A1A1A] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Description */}
          {property.observations && (
            <div className="mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-display">Descripción</h3>
              <p className="text-[#B0B0B0] leading-relaxed">{property.observations}</p>
            </div>
          )}

          {/* Features */}
          <div className="mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8 font-display">Características</h3>

            {/* Internal Features */}
            {property.features.internal.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-[#C9A962] mb-4">Interiores</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.features.internal.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[#242424] p-4 rounded-lg">
                      <svg className="w-5 h-5 text-[#C9A962] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#B0B0B0]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Features */}
            {property.features.external.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold text-[#C9A962] mb-4">Exteriores</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.features.external.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[#242424] p-4 rounded-lg">
                      <svg className="w-5 h-5 text-[#C9A962] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#B0B0B0]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map Placeholder */}
          <div className="bg-[#242424] rounded-lg overflow-hidden h-96">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBQhTnzz-R2t91cLdPPOdVlGg6RgkxEBUg&q=${encodeURIComponent(`${property.address}, ${property.city_label}`)}`}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Lead Capture Form */}
      <section className="bg-[#0D0D0D] py-16 sm:py-24" id="lead-form">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-display">¿Interesado en esta propiedad?</h2>
            <p className="text-[#B0B0B0]">Déjanos tus datos y te contactaremos pronto</p>
          </div>

          <FunnelForm
            propertyId={property.id_property}
            propertyType={property.property_type_label}
            utmSource={utmSource}
            utmMedium={utmMedium}
            utmCampaign={utmCampaign}
          />
        </div>
      </section>

      {/* Footer Mini */}
      <footer className="bg-[#1A1A1A] border-t border-[#333333] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-white mb-2 font-display">Indubienes</h3>
              <p className="text-[#707070] text-sm">Inmobiliaria Premium en Medellín</p>
            </div>

            <a
              href={`https://wa.me/573177597155`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-500 hover:text-green-400 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.6 6.32c-1.63-1.6-3.8-2.48-6.1-2.48-4.76 0-8.63 3.87-8.63 8.63 0 1.52.39 3 1.15 4.31L2.9 21.1l4.54-1.19c1.26.68 2.68 1.04 4.13 1.04 4.76 0 8.63-3.87 8.63-8.63 0-2.3-.95-4.46-2.64-6z" />
              </svg>
              Contáctanos por WhatsApp
            </a>
          </div>

          <div className="border-t border-[#333333] mt-6 pt-6 text-center text-[#707070] text-xs">
            <p>Tus datos están protegidos y encriptados. No compartimos tu información.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
