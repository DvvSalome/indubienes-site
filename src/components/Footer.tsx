import Link from 'next/link';
import Logo from './Logo';

const propertyTypes = [
  { label: 'Apartamentos', id: 2, icon: (<><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" /><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" /></>) },
  { label: 'Casas',        id: 3, icon: (<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />) },
  { label: 'Apartaestudios', id: 1, icon: (<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M15 9v12" /></>) },
  { label: 'Locales',      id: 4, icon: (<><path d="M3 9l1-5h16l1 5M3 9v11h18V9M3 9h18" /><path d="M9 20v-6h6v6" /></>) },
  { label: 'Bodegas',      id: 5, icon: (<><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35z" /><path d="M6 18h12v-7H6z" /></>) },
  { label: 'Fincas',       id: 6, icon: (<><path d="M2 22h20M4 22V10l8-6 8 6v12" /><path d="M10 22v-6h4v6" /><circle cx="18" cy="6" r="2" /></>) },
];

const navLinks = [
  { label: 'Inicio',       href: '/' },
  { label: 'Propiedades',  href: '/propiedades' },
  { label: 'Venta',        href: '/propiedades?tipo=venta' },
  { label: 'Arriendo',     href: '/propiedades?tipo=arriendo' },
  { label: 'Contacto',     href: '/contacto' },
];

const socialLinks = [
  { href: 'https://www.facebook.com/Indubienes-1368142806533716/', label: 'Facebook',  icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { href: 'https://twitter.com/indubienes_sas', label: 'Twitter / X', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { href: 'https://wa.me/573177597155', label: 'WhatsApp',  icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
  { href: 'https://instagram.com/indubienes', label: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.15 0-3.504.012-4.73.068-1.014.046-1.566.213-1.93.354-.487.188-.835.413-1.2.778-.365.365-.59.713-.778 1.2-.141.364-.308.916-.354 1.93-.056 1.226-.068 1.58-.068 4.73s.012 3.504.068 4.73c.046 1.014.213 1.566.354 1.93.188.487.413.835.778 1.2.365.365.713.59 1.2.778.364.141.916.308 1.93.354 1.226.056 1.58.068 4.73.068s3.504-.012 4.73-.068c1.014-.046 1.566-.213 1.93-.354.487-.188.835-.413 1.2-.778.365-.365.59-.713.778-1.2.141-.364.308-.916.354-1.93.056-1.226.068-1.58.068-4.73s-.012-3.504-.068-4.73c-.046-1.014-.213-1.566-.354-1.93a3.232 3.232 0 00-.778-1.2 3.232 3.232 0 00-1.2-.778c-.364-.141-.916-.308-1.93-.354-1.226-.056-1.58-.068-4.73-.068zM12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm6.538-8.671a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z' },
];

/* Grain SVG data URI — matches the one used in /propiedades mini-hero */
const GRAIN_BG = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/* Section heading — reusable for consistency across columns */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-display text-[11px] text-gold mb-6 font-bold tracking-[0.22em] uppercase flex items-center gap-2.5">
      <span className="block w-5 h-[1.5px] bg-gold/80" aria-hidden="true" />
      {children}
    </h4>
  );
}

export default function Footer() {
  return (
    <footer className="relative text-white/80 isolate">
      {/* ============================== */}
      {/* BAND 1 · CTA BAND              */}
      {/* ============================== */}
      <section
        className="relative bg-neutral-900 overflow-hidden"
        aria-label="Contáctanos"
      >
        {/* Top gold hairline — visual signature */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" aria-hidden="true" />
        {/* Soft radial gold glow on the right side */}
        <div
          className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-[0.08] blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(201,169,98,1) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: GRAIN_BG }} aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">
            {/* Tagline */}
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold/90 mb-3 font-bold">
                <span className="inline-block w-5 h-[1px] bg-gold/70 align-middle mr-2" aria-hidden="true" />
                ¿Listos para dar el siguiente paso?
              </p>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-[32px] leading-tight text-white max-w-2xl">
                Tu próximo hogar o inversión
                <span className="block text-gold italic font-light">empieza con una conversación.</span>
              </h3>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="https://wa.me/573177597155"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2.5 min-h-[52px] px-7 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-body font-semibold text-[15px] rounded-full transition-all duration-300 shadow-lg shadow-[#25D366]/20 hover:shadow-xl hover:shadow-[#25D366]/30 hover:-translate-y-0.5 tracking-wide"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hablemos por WhatsApp
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center min-h-[52px] px-7 border border-white/25 hover:border-gold/60 hover:bg-white/[0.04] text-white font-body font-medium text-[15px] rounded-full transition-all duration-300 tracking-wide"
              >
                Enviar mensaje
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* BAND 2 · MAIN GRID             */}
      {/* ============================== */}
      <section className="relative bg-neutral-950">
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: GRAIN_BG }} aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
          {/* ===== 12-col grid · 2-col mobile ===== */}
          <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-14 md:gap-y-12">

            {/* BRAND column — full width mobile, 4 cols desktop */}
            <div className="col-span-2 md:col-span-4 md:pr-8">
              {/* Logo on a clean white plaque to guarantee contrast */}
              <div className="inline-block rounded-2xl bg-white px-5 py-3.5 shadow-xl shadow-black/30 ring-1 ring-white/10">
                <Logo height={52} />
              </div>
              <p className="mt-6 font-display italic text-[15px] leading-relaxed text-white/60 max-w-[340px]">
                En Medellín, ayudando a familias a encontrar su próximo hogar — y a inversionistas su próximo negocio.
              </p>
              {/* Social row */}
              <nav aria-label="Redes sociales" className="mt-7 flex gap-2.5">
                {socialLinks.map(({ href, label, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/60 hover:text-gold hover:bg-gold/10 hover:border-gold/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icon} /></svg>
                  </a>
                ))}
              </nav>
            </div>

            {/* NAVEGAR column */}
            <div className="md:col-span-2">
              <SectionHeading>Navegar</SectionHeading>
              <ul className="space-y-1">
                {navLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group inline-flex items-center gap-2.5 py-2.5 text-[14px] text-white/65 hover:text-gold transition-colors duration-200 min-h-[44px]"
                    >
                      <span className="w-0 group-hover:w-3 h-[1px] bg-gold transition-all duration-300" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* TIPOS DE INMUEBLE column */}
            <div className="md:col-span-3">
              <SectionHeading>Tipos de inmueble</SectionHeading>
              <ul className="space-y-1">
                {propertyTypes.map(({ label, id, icon }) => (
                  <li key={label}>
                    <Link
                      href={`/propiedades?propiedad=${id}`}
                      className="group flex items-center gap-3 py-2.5 text-[14px] text-white/65 hover:text-gold transition-colors duration-200 min-h-[44px]"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 text-white/50 group-hover:border-gold/40 group-hover:text-gold group-hover:bg-gold/10 transition-all duration-300">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          {icon}
                        </svg>
                      </span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* HABLEMOS column — contact info with double hierarchy */}
            <address className="col-span-2 md:col-span-3 not-italic">
              <SectionHeading>Hablemos</SectionHeading>
              <ul className="space-y-4">
                {/* Address */}
                <li className="flex items-start gap-3 min-h-[44px]">
                  <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 text-gold mt-[2px]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <div className="leading-tight">
                    <span className="block text-[10px] uppercase tracking-[0.15em] text-white/40 mb-0.5">Oficina principal</span>
                    <span className="block text-[14px] text-white/80">Cra 77 #36-31, Laureles</span>
                    <span className="block text-[13px] text-white/55">Medellín, Colombia</span>
                  </div>
                </li>

                {/* Phone */}
                <li>
                  <a
                    href="tel:+576043220207"
                    className="group flex items-start gap-3 min-h-[44px] hover:-translate-y-px transition-transform duration-200"
                  >
                    <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 text-gold group-hover:border-gold/40 group-hover:bg-gold/10 transition-all duration-300 mt-[2px]">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <div className="leading-tight">
                      <span className="block text-[10px] uppercase tracking-[0.15em] text-white/40 mb-0.5">Llámanos</span>
                      <span className="block text-[15px] text-white font-medium group-hover:text-gold transition-colors">604 322 0207</span>
                    </div>
                  </a>
                </li>

                {/* WhatsApp */}
                <li>
                  <a
                    href="https://wa.me/573177597155"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 min-h-[44px] hover:-translate-y-px transition-transform duration-200"
                  >
                    <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 text-[#25D366] group-hover:border-[#25D366]/50 group-hover:bg-[#25D366]/10 transition-all duration-300 mt-[2px]">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </span>
                    <div className="leading-tight">
                      <span className="block text-[10px] uppercase tracking-[0.15em] text-white/40 mb-0.5">WhatsApp directo</span>
                      <span className="block text-[15px] text-white font-medium group-hover:text-[#25D366] transition-colors">317 759 7155</span>
                    </div>
                  </a>
                </li>

                {/* Email */}
                <li>
                  <a
                    href="mailto:gerencia@indubienes.com"
                    className="group flex items-start gap-3 min-h-[44px] hover:-translate-y-px transition-transform duration-200"
                  >
                    <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 text-gold group-hover:border-gold/40 group-hover:bg-gold/10 transition-all duration-300 mt-[2px]">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <div className="leading-tight min-w-0 flex-1">
                      <span className="block text-[10px] uppercase tracking-[0.15em] text-white/40 mb-0.5">Correo</span>
                      <span className="block text-[14px] text-white/85 font-medium group-hover:text-gold transition-colors truncate">gerencia@indubienes.com</span>
                    </div>
                  </a>
                </li>
              </ul>
            </address>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* BAND 3 · LEGAL STRIP           */}
      {/* ============================== */}
      <section className="relative bg-black">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-[11px] text-white/40 tracking-wide order-2 sm:order-1">
              © {new Date().getFullYear()} INMOBILIARIA INDUBIENES SAS · NIT 900965649 · Medellín, Colombia
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] order-1 sm:order-2">
              <Link href="/politica-privacidad" className="text-white/50 hover:text-gold transition-colors">Política de Privacidad</Link>
              <span className="text-white/20" aria-hidden="true">·</span>
              <Link href="/autorizacion-datos" className="text-white/50 hover:text-gold transition-colors">Autorización de Datos</Link>
              <span className="text-white/20" aria-hidden="true">·</span>
              <Link href="/politica-privacidad#cookies" className="text-white/50 hover:text-gold transition-colors">Cookies</Link>
            </div>
          </div>
          <p className="mt-3 text-center text-[10px] text-white/30 tracking-wider uppercase">
            Hecho con <span className="text-gold/70">♥</span> en Medellín
          </p>
        </div>
      </section>
    </footer>
  );
}
