'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Property } from '@/lib/types';
import { formatPrice } from '@/lib/wasi';

interface Props {
  property: Property;
}

export default function PropertyDetailClient({ property }: Props) {
  const allImages = [
    property.main_image,
    ...(property.galleries?.flatMap(g => g.images) || []),
  ].filter(img => img?.url);

  const [currentImage, setCurrentImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: `Hola, estoy interesado en la propiedad "${property.title}" (ID: ${property.id_property}). Me gustaría recibir más información.`,
  });

  const price = property.for_sale && property.sale_price
    ? property.sale_price_label || formatPrice(property.sale_price)
    : property.rent_price_label || formatPrice(property.rent_price);

  const businessType = property.for_sale ? 'Venta' : 'Arriendo';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `${property.title} - ${price}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hola, soy ${formData.nombre}. ${formData.mensaje}\n\nEmail: ${formData.email}\nTeléfono: ${formData.telefono}`
    );
    window.open(`https://wa.me/573177597155?text=${msg}`, '_blank');
  };

  return (
    <div className="pt-20 sm:pt-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted font-body">
          <Link href="/" className="hover:text-gold transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/propiedades" className="hover:text-gold transition-colors">Propiedades</Link>
          <span>/</span>
          <span className="text-foreground">{property.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-surface mb-3">
                {allImages.length > 0 ? (
                  <img
                    src={allImages[currentImage]?.url_big || allImages[currentImage]?.url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-faint">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}

                {/* Nav arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage(i => (i - 1 + allImages.length) % allImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentImage(i => (i + 1) % allImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image counter */}
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full font-body">
                  {currentImage + 1} / {allImages.length}
                </div>

                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-gold text-[#0D0D0D] text-xs font-body font-semibold rounded-full tracking-wide uppercase">
                    {businessType}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === currentImage ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {property.property_type_label && (
                    <span className="text-xs font-body text-gold uppercase tracking-wider">{property.property_type_label}</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-display text-foreground mb-2">
                  {property.title}
                </h1>
                <p className="text-muted font-body flex items-center gap-1.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {property.address || property.location_label || `${property.zone_label}, ${property.city_label}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl sm:text-3xl font-display text-gold">
                  {price}
                </p>
                {property.for_sale && property.for_rent && property.rent_price > 0 && (
                  <p className="text-sm text-muted font-body mt-1">
                    Arriendo: {property.rent_price_label || formatPrice(property.rent_price)}
                  </p>
                )}
              </div>
            </div>

            {/* Quick specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Habitaciones', value: property.bedrooms, icon: 'M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M21 10H3V7a2 2 0 012-2h14a2 2 0 012 2v3z' },
                { label: 'Baños', value: property.bathrooms, icon: 'M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1zM6 12V5a2 2 0 012-2h3v2.25' },
                { label: 'Área', value: property.area ? `${property.area} m²` : null, icon: 'M3 3h18v18H3zM3 9h18M9 21V9' },
                { label: 'Parqueaderos', value: property.garages, icon: 'M3 21V8l9-5 9 5v13M3 21h18M9 21v-6h6v6' },
              ].filter(s => s.value).map((spec) => (
                <div key={spec.label} className="bg-surface rounded-xl p-4 text-center">
                  <svg className="w-6 h-6 text-gold mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={spec.icon} />
                  </svg>
                  <p className="text-lg font-display text-foreground">{spec.value}</p>
                  <p className="text-xs text-muted font-body">{spec.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {property.observations && (
              <div className="mb-8">
                <h2 className="text-xl font-display text-foreground mb-4">Descripción</h2>
                <p className="text-muted font-body leading-relaxed whitespace-pre-line">
                  {property.observations}
                </p>
              </div>
            )}

            {/* Features */}
            {(property.features?.internal?.length > 0 || property.features?.external?.length > 0) && (
              <div className="mb-8">
                <h2 className="text-xl font-display text-foreground mb-4">Características</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {property.features?.internal?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-body font-semibold text-gold uppercase tracking-wider mb-3">Internas</h3>
                      <ul className="space-y-2">
                        {property.features.internal.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted font-body">
                            <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {property.features?.external?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-body font-semibold text-gold uppercase tracking-wider mb-3">Externas</h3>
                      <ul className="space-y-2">
                        {property.features.external.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted font-body">
                            <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Map placeholder */}
            {property.latitude && property.longitude && (
              <div className="mb-8">
                <h2 className="text-xl font-display text-foreground mb-4">Ubicación</h2>
                <div className="aspect-[16/9] rounded-xl overflow-hidden border border-border">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.01},${property.latitude - 0.005},${property.longitude + 0.01},${property.latitude + 0.005}&layer=mapnik&marker=${property.latitude},${property.longitude}`}
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Ubicación de la propiedad"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Actions */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display text-lg text-foreground mb-4">¿Te interesa?</h3>
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/573177597155?text=${encodeURIComponent(`Hola, me interesa la propiedad "${property.title}" (ID: ${property.id_property}), ${price}. Me gustaría más información.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-body font-semibold text-sm rounded-lg transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Escribir por WhatsApp
                  </a>
                  <a
                    href="tel:+576043220207"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gold hover:bg-gold-hover text-[#0D0D0D] font-body font-semibold text-sm rounded-lg transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Llamar ahora
                  </a>
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-border text-muted hover:text-foreground font-body text-sm rounded-lg transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    Compartir
                  </button>
                </div>
              </div>

              {/* Contact form */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display text-lg text-foreground mb-4">Solicitar información</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="w-full bg-surface text-foreground border border-border rounded-lg px-4 py-2.5 text-sm font-body placeholder:text-faint"
                  />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-surface text-foreground border border-border rounded-lg px-4 py-2.5 text-sm font-body placeholder:text-faint"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-surface text-foreground border border-border rounded-lg px-4 py-2.5 text-sm font-body placeholder:text-faint"
                  />
                  <textarea
                    placeholder="Mensaje"
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    rows={4}
                    className="w-full bg-surface text-foreground border border-border rounded-lg px-4 py-2.5 text-sm font-body placeholder:text-faint resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-gold hover:bg-gold-hover text-[#0D0D0D] font-body font-semibold text-sm rounded-lg transition-colors"
                  >
                    Enviar mensaje
                  </button>
                </form>
              </div>

              {/* Company info */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display text-lg text-foreground mb-3">INDUBIENES SAS</h3>
                <div className="space-y-2 text-sm text-muted font-body">
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Cra 77 #36-31, Laureles, Medellín
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    +57 604 322 0207
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    gerencia@indubienes.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
