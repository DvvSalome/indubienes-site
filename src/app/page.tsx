import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';
import { getHighlightedProperties } from '@/lib/wasi';
import HeroSearch from '@/components/HeroSearch';
import HomeAnimations from '@/components/HomeAnimations';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const properties = await getHighlightedProperties();

  return (
    <>
      <HomeAnimations />

      {/* Hero Section */}
      <section className="hero-section relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background image with Ken Burns */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="hero-bg-image absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop')`,
              transform: 'scale(1.15)',
            }}
          />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <p className="hero-tagline text-gold text-sm sm:text-base font-body tracking-[0.3em] uppercase mb-6" >
            Inmobiliaria en Medellín
          </p>

          <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display text-white mb-8 leading-[1.1]" style={{ perspective: '600px' }}>
            <span className="block overflow-hidden">
              <span className="hero-word inline-block" >Encuentra</span>{' '}
              <span className="hero-word inline-block" >tu</span>{' '}
              <span className="hero-word inline-block" >lugar</span>
            </span>
            <span className="block overflow-hidden mt-2">
              <span className="hero-word inline-block gold-text" >ideal</span>{' '}
              <span className="hero-word inline-block gold-text" >para</span>{' '}
              <span className="hero-word inline-block gold-text" >vivir</span>
            </span>
          </h1>

          <p className="hero-subtitle text-lg sm:text-xl text-white/60 font-body max-w-2xl mx-auto mb-12" >
            Apartamentos, casas y propiedades en las mejores zonas de Medellín y el Área Metropolitana
          </p>

          <HeroSearch />
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" >
          <span className="text-white/30 text-[10px] font-body tracking-[0.25em] uppercase">Explorar</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Featured Properties */}
      <section className="featured-section py-24 sm:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="featured-tagline scroll-reveal text-gold text-xs sm:text-sm font-body tracking-[0.3em] uppercase mb-4">Selección exclusiva</p>
            <div className="section-line scroll-reveal reveal-line w-12 h-[1px] bg-gold mx-auto mb-6 origin-left" data-delay="100" />
            <h2 className="featured-title scroll-reveal text-3xl sm:text-4xl lg:text-5xl font-display text-foreground mb-5 leading-tight" data-delay="150">
              Propiedades Destacadas
            </h2>
            <p className="featured-desc scroll-reveal text-muted font-body max-w-xl mx-auto leading-relaxed" data-delay="250">
              Descubre nuestra selección de propiedades premium en las ubicaciones más cotizadas de Medellín
            </p>
          </div>

          <div className="properties-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {properties.slice(0, 6).map((property, i) => (
              <div key={property.id_property} className="property-card-wrapper scroll-reveal" data-delay={i * 100}>
                <PropertyCard property={property} />
              </div>
            ))}
          </div>

          <div className="featured-cta scroll-reveal text-center mt-14">
            <Link
              href="/propiedades"
              className="group inline-flex items-center gap-3 px-10 py-4 bg-gold hover:bg-gold-hover text-white font-body font-semibold text-sm tracking-wide rounded-full transition-all duration-500 hover:shadow-xl hover:shadow-gold/20"
            >
              Ver todas las propiedades
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section py-24 sm:py-32 px-4 bg-surface overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Image */}
            <div className="about-animate about-image scroll-reveal reveal-left relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"
                  alt="Oficina Indubienes"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border border-gold/20 rounded-2xl -z-10 hidden sm:block" />
              {/* Floating stat card */}
              <div className="stat-animate about-stat-card scroll-reveal reveal-scale absolute -bottom-6 -right-6 bg-card rounded-xl p-6 shadow-2xl border border-border hidden sm:block" data-delay="300">
                <p className="text-3xl font-display text-gold mb-1">10+</p>
                <p className="text-sm text-muted font-body">Años de experiencia</p>
              </div>
            </div>

            {/* Content */}
            <div className="about-animate about-content scroll-reveal reveal-right" data-delay="150">
              <p className="text-gold text-xs sm:text-sm font-body tracking-[0.3em] uppercase mb-4">Sobre nosotros</p>
              <div className="w-12 h-[1px] bg-gold mb-6" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-foreground mb-8 leading-tight">
                Su aliado inmobiliario<br />
                <span className="text-gold">en Medellín</span>
              </h2>
              <p className="text-muted font-body leading-relaxed mb-5">
                Indubienes es una inmobiliaria en Medellín especializada en venta, arriendo y administración de propiedades. Trabajamos con apartamentos, casas, fincas, lotes y locales comerciales, en zonas como Laureles, El Poblado, Belén, Envigado, Sabaneta y otros municipios del Área Metropolitana.
              </p>
              <p className="text-muted font-body leading-relaxed mb-10">
                Nuestro compromiso es brindarle un servicio personalizado, transparente y profesional, ayudándole a encontrar la propiedad perfecta para sus necesidades o a obtener la mejor rentabilidad de su inversión inmobiliaria.
              </p>

              {/* Features */}
              <div className="about-features-grid grid grid-cols-2 gap-4 mb-10">
                {[
                  'Asesoría personalizada',
                  'Avalúos profesionales',
                  'Administración de inmuebles',
                  'Gestión legal completa',
                ].map((feature) => (
                  <div key={feature} className="about-feature flex items-center gap-2.5 group">
                    <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors duration-300">
                      <svg className="w-3 h-3 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-sm font-body text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/contacto"
                className="group inline-flex items-center gap-3 px-10 py-4 bg-gold hover:bg-gold-hover text-white font-body font-semibold text-sm tracking-wide rounded-full transition-all duration-500 hover:shadow-xl hover:shadow-gold/20"
              >
                Contáctenos
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-24 sm:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#111] to-[#0D0D0D]" />
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/[0.02] rounded-full blur-3xl" />

        <div className="cta-content scroll-reveal relative z-10 max-w-3xl mx-auto text-center">
          <p className="cta-animate text-gold text-xs sm:text-sm font-body tracking-[0.3em] uppercase mb-4">Trabajemos juntos</p>
          <div className="cta-animate gold-line-animate w-12 h-[1px] bg-gold/50 mx-auto mb-8 origin-left" />
          <h2 className="cta-animate text-3xl sm:text-4xl lg:text-5xl font-display text-white mb-8 leading-tight">
            ¿Busca vender o arrendar<br />su propiedad?
          </h2>
          <p className="text-white/50 font-body mb-12 max-w-lg mx-auto leading-relaxed">
            Confíe en nuestra experiencia para obtener el mejor resultado. Le acompañamos en cada paso del proceso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/573177597155?text=Hola%2C%20me%20gustaría%20vender/arrendar%20mi%20propiedad"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#25D366] hover:bg-[#20BD5A] text-white font-body font-semibold text-sm tracking-wide rounded-full transition-all duration-500 hover:shadow-xl hover:shadow-[#25D366]/20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="transition-transform duration-300 group-hover:scale-110">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Escribir por WhatsApp
            </a>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-white/15 hover:border-gold text-white hover:text-gold font-body font-semibold text-sm tracking-wide rounded-full transition-all duration-500"
            >
              Formulario de contacto
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
