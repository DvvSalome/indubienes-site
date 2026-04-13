import Link from 'next/link';
import Image from 'next/image';
import PropertyCard from '@/components/PropertyCard';
import { getHighlightedProperties } from '@/lib/wasi';
import HeroSearch from '@/components/HeroSearch';
import HomeAnimations from '@/components/HomeAnimations';
import HeroRotatingLine from '@/components/HeroRotatingLine';
import HeroVideo from '@/components/HeroVideo';
import AlliesSlider from '@/components/AlliesSlider';
import BlogCard from '@/components/BlogCard';
import { searchNews } from '@/lib/wasi';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [properties, newsResult] = await Promise.all([
    getHighlightedProperties(),
    searchNews({ skip: 0, take: 3 }),
  ]);
  const latestPosts = newsResult.news;

  return (
    <>
      <HomeAnimations />

      {/* Hero Section */}
      <section className="hero-section antialiased relative h-screen min-h-[640px] sm:min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background video (or fallback image) */}
        <div className="absolute inset-0 overflow-hidden">
          <HeroVideo />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />

        {/* Top gradient for header readability */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent z-[2]" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-5 text-center pt-16 sm:pt-24">
          <p className="hero-tagline text-white/90 text-xs sm:text-sm font-body font-semibold tracking-[0.22em] sm:tracking-[0.3em] uppercase mb-4 sm:mb-6" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.55)' }}>
            Inmobiliaria en Medellín
          </p>

          <h1 className="hero-title text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-white mb-6 sm:mb-8 leading-[1.05] tracking-[-0.01em]" style={{ perspective: '600px', textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}>
            <span className="block overflow-hidden">
              <span className="hero-word inline-block" >Encuentra</span>{' '}
              <span className="hero-word inline-block" >tu</span>{' '}
              <span className="hero-word inline-block" >lugar</span>
            </span>
            <HeroRotatingLine />
          </h1>

          <p className="hero-subtitle text-base sm:text-xl text-white/90 font-body font-normal max-w-[22ch] sm:max-w-xl mx-auto mb-8 sm:mb-12 leading-snug sm:leading-relaxed" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.45)' }}>
            Apartamentos, casas y propiedades en las mejores zonas de Medellín.
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
            <h2 className="featured-title scroll-reveal font-display font-bold text-foreground mb-5 leading-tight" style={{ fontSize: '45px' }} data-delay="150">
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

      {/* Allies / Partners Logo Slider */}
      <AlliesSlider />

      {/* About Section */}
      <section className="about-section py-20 sm:py-32 px-5 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center">
            {/* Image */}
            <div className="about-animate about-image scroll-reveal reveal-left relative overflow-hidden sm:overflow-visible">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative bg-neutral-100">
                <Image
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=900&fit=crop&auto=format&q=80"
                  alt="Asesor inmobiliario acompañando a una familia en la búsqueda de su propiedad"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border border-gold/20 rounded-2xl -z-10 hidden sm:block" />
              {/* Floating stat card */}
              <div className="stat-animate about-stat-card scroll-reveal reveal-scale absolute -bottom-6 -right-6 bg-card rounded-xl p-6 shadow-2xl border border-border hidden sm:block" data-delay="300">
                <p className="text-3xl font-display font-bold text-gold mb-1">10+</p>
                <p className="text-sm text-muted font-body font-medium">Años de experiencia</p>
              </div>
            </div>

            {/* Content */}
            <div className="about-animate about-content scroll-reveal reveal-right min-w-0" data-delay="150">
              <p className="text-gold text-xs sm:text-sm font-body font-semibold tracking-[0.3em] uppercase mb-4">Sobre nosotros</p>
              <div className="w-12 h-[1px] bg-gold mb-8" />
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-display font-bold text-foreground mb-8 sm:mb-10 leading-tight tracking-tight">
                Su aliado inmobiliario<br />
                <span className="text-gold">en Medellín</span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted/90 font-body leading-relaxed sm:leading-[1.8] mb-6 sm:tracking-wide break-words">
                Somos una inmobiliaria especializada en <span className="text-foreground font-medium">venta, arriendo y administración</span> de propiedades en las zonas más cotizadas de Medellín y el Área Metropolitana.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-muted/90 font-body leading-relaxed sm:leading-[1.8] mb-10 sm:tracking-wide break-words">
                Con presencia en <span className="text-foreground font-medium">Laureles, El Poblado, Envigado y Sabaneta</span>, ofrecemos un servicio personalizado, transparente y profesional en cada etapa del proceso.
              </p>

              {/* Features */}
              <div className="about-features-grid grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 sm:gap-y-5 mb-8 sm:mb-12">
                {[
                  'Asesoría personalizada',
                  'Avalúos profesionales',
                  'Administración de inmuebles',
                  'Gestión legal completa',
                ].map((feature) => (
                  <div key={feature} className="about-feature flex items-center gap-3 group">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors duration-300">
                      <svg className="w-3.5 h-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base font-body font-medium text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/contacto"
                className="group block w-full border-l-[3px] border-gold bg-card hover:bg-card-hover rounded-r-xl pl-5 pr-5 py-5 transition-all duration-500 hover:shadow-lg hover:shadow-gold/10 hover:border-l-[4px]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base sm:text-lg font-display font-bold text-foreground mb-1 tracking-tight">
                      Contáctenos
                    </p>
                    <p className="text-xs sm:text-sm text-muted font-body">
                      Le asesoramos sin compromiso
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-all duration-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold transition-transform duration-300 group-hover:translate-x-0.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      {latestPosts.length > 0 && (
        <section className="blog-section py-24 sm:py-32 px-5 sm:px-6 lg:px-8 bg-neutral-50/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14 sm:mb-16">
              <p className="text-gold text-xs sm:text-sm font-body tracking-[0.3em] uppercase mb-4">
                Conocimiento experto
              </p>
              <div className="gold-line-animate w-12 h-[1px] bg-gold/50 mx-auto mb-8 origin-left" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
                Últimas publicaciones
              </h2>
              <p className="text-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Consejos, guías y análisis del mercado inmobiliario en Medellín
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {latestPosts.map((post, idx) => (
                <BlogCard key={post.id_news} post={post} priority={idx === 0} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-8 py-4 border border-gold/30 hover:bg-gold hover:text-white text-gold font-body font-semibold text-sm tracking-wide rounded-full transition-all duration-500"
              >
                Ver todas las publicaciones
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section py-24 sm:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#111] to-[#0D0D0D]" />
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/[0.02] rounded-full blur-3xl" />

        <div className="cta-content scroll-reveal relative z-10 max-w-3xl mx-auto text-center">
          <p className="cta-animate text-gold text-xs sm:text-sm font-body tracking-[0.3em] uppercase mb-4">Trabajemos juntos</p>
          <div className="cta-animate gold-line-animate w-12 h-[1px] bg-gold/50 mx-auto mb-8 origin-left" />
          <h2 className="cta-animate text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-8 leading-tight">
            ¿Busca vender o arrendar<br />su propiedad?
          </h2>
          <p className="text-sm sm:text-lg text-white/60 font-body font-medium mb-12 max-w-lg mx-auto leading-relaxed sm:leading-[1.8] sm:tracking-wide px-2">
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

