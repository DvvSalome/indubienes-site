import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';
import { getHighlightedProperties } from '@/lib/wasi';
import HeroSearch from '@/components/HeroSearch';

export default async function HomePage() {
  const properties = await getHighlightedProperties();

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop')`,
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <p className="text-gold text-sm sm:text-base font-body tracking-[0.3em] uppercase mb-4 animate-fade-in">
            Inmobiliaria en Medellín
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display text-white mb-6 animate-slide-up leading-tight">
            Encuentra tu lugar<br />
            <span className="gold-text">ideal para vivir</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 font-body max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Apartamentos, casas y propiedades en las mejores zonas de Medellín y el Área Metropolitana
          </p>

          {/* Search Bar */}
          <HeroSearch />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-gold text-sm font-body tracking-[0.2em] uppercase mb-3">Selección exclusiva</p>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-4">
              Propiedades Destacadas
            </h2>
            <p className="text-muted font-body max-w-xl mx-auto">
              Descubre nuestra selección de propiedades premium en las ubicaciones más cotizadas de Medellín
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {properties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id_property} property={property} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/propiedades"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold hover:bg-gold-hover text-[#0D0D0D] font-body font-semibold text-sm tracking-wide rounded-full transition-all duration-300 hover:shadow-lg"
            >
              Ver todas las propiedades
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 sm:py-28 px-4 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"
                  alt="Oficina Indubienes"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-6 -right-6 bg-card rounded-xl p-6 shadow-xl border border-border hidden sm:block">
                <p className="text-3xl font-display text-gold mb-1">10+</p>
                <p className="text-sm text-muted font-body">Años de experiencia</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-gold text-sm font-body tracking-[0.2em] uppercase mb-3">Sobre nosotros</p>
              <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-6 leading-tight">
                Su aliado inmobiliario<br />
                <span className="text-gold">en Medellín</span>
              </h2>
              <p className="text-muted font-body leading-relaxed mb-6">
                Indubienes es una inmobiliaria en Medellín especializada en venta, arriendo y administración de propiedades. Trabajamos con apartamentos, casas, fincas, lotes y locales comerciales, en zonas como Laureles, El Poblado, Belén, Envigado, Sabaneta y otros municipios del Área Metropolitana.
              </p>
              <p className="text-muted font-body leading-relaxed mb-8">
                Nuestro compromiso es brindarle un servicio personalizado, transparente y profesional, ayudándole a encontrar la propiedad perfecta para sus necesidades o a obtener la mejor rentabilidad de su inversión inmobiliaria.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  'Asesoría personalizada',
                  'Avalúos profesionales',
                  'Administración de inmuebles',
                  'Gestión legal completa',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm font-body text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold hover:bg-gold-hover text-[#0D0D0D] font-body font-semibold text-sm tracking-wide rounded-full transition-all duration-300 hover:shadow-lg"
              >
                Contáctenos
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D]" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-display text-white mb-6">
            ¿Busca vender o arrendar<br />su propiedad?
          </h2>
          <p className="text-white/60 font-body mb-10 max-w-lg mx-auto">
            Confíe en nuestra experiencia para obtener el mejor resultado. Le acompañamos en cada paso del proceso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/573177597155?text=Hola%2C%20me%20gustaría%20vender/arrendar%20mi%20propiedad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-body font-semibold text-sm tracking-wide rounded-full transition-all duration-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Escribir por WhatsApp
            </a>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/20 hover:border-gold text-white hover:text-gold font-body font-semibold text-sm tracking-wide rounded-full transition-all duration-300"
            >
              Formulario de contacto
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
