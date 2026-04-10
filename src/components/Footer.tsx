import Link from 'next/link';
import Logo from './Logo';

// IMPORTANT: IDs are the real WASI property-type IDs for this company.
// Verified against live /api/properties results on 2026-04-10.
//   1=Casa, 2=Apartamento, 3=Local, 4=Oficina, 5=Lote, 7=Finca, 8=Bodega, 14=Apartaestudio
const propertyTypes = [
  { label: 'Apartamentos', id: 2, icon: (<><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" /><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" /></>) },
  { label: 'Casas', id: 1, icon: (<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />) },
  { label: 'Apartaestudios', id: 14, icon: (<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M15 9v12" /></>) },
  { label: 'Locales', id: 3, icon: (<><path d="M3 9l1-5h16l1 5M3 9v11h18V9M3 9h18" /><path d="M9 20v-6h6v6" /></>) },
  { label: 'Bodegas', id: 8, icon: (<><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35z" /><path d="M6 18h12v-7H6z" /></>) },
  { label: 'Fincas', id: 7, icon: (<><path d="M2 22h20M4 22V10l8-6 8 6v12" /><path d="M10 22v-6h4v6" /><circle cx="18" cy="6" r="2" /></>) },
];

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Propiedades', href: '/propiedades' },
  { label: 'Venta', href: '/propiedades?tipo=venta' },
  { label: 'Arriendo', href: '/propiedades?tipo=arriendo' },
  { label: 'Contacto', href: '/contacto' },
];

const socialLinks = [
  { href: 'https://www.facebook.com/Indubienes-1368142806533716/', label: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { href: 'https://twitter.com/indubienes_sas', label: 'Twitter / X', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { href: 'https://wa.me/573177597155', label: 'WhatsApp', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
  { href: 'https://instagram.com/indubienes', label: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.15 0-3.504.012-4.73.068-1.014.046-1.566.213-1.93.354-.487.188-.835.413-1.2.778-.365.365-.59.713-.778 1.2-.141.364-.308.916-.354 1.93-.056 1.226-.068 1.58-.068 4.73s.012 3.504.068 4.73c.046 1.014.213 1.566.354 1.93.188.487.413.835.778 1.2.365.365.713.59 1.2.778.364.141.916.308 1.93.354 1.226.056 1.58.068 4.73.068s3.504-.012 4.73-.068c1.014-.046 1.566-.213 1.93-.354.487-.188.835-.413 1.2-.778.365-.365.59-.713.778-1.2.141-.364.308-.916.354-1.93.056-1.226.068-1.58.068-4.73s-.012-3.504-.068-4.73c-.046-1.014-.213-1.566-.354-1.93a3.232 3.232 0 00-.778-1.2 3.232 3.232 0 00-1.2-.778c-.364-.141-.916-.308-1.93-.354-1.226-.056-1.58-.068-4.73-.068zM12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm6.538-8.671a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z' },
];

/* Reusable heading inside each bento card */
function CardHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-display text-[11px] text-foreground mb-5 font-bold tracking-[0.18em] uppercase flex items-center gap-2">
      <span className="block w-6 h-[2px] bg-gold" aria-hidden="true" />
      {children}
    </h4>
  );
}

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">

        {/* ===== CTA STRIP ===== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF7EF] via-white to-[#FAF7EF] border border-gold/20 shadow-sm mb-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" aria-hidden="true" />
          <div className="px-6 sm:px-10 py-8 sm:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-[11px] tracking-[0.22em] uppercase text-gold font-bold mb-2">Siguiente paso</p>
              <h3 className="font-display text-2xl sm:text-3xl text-foreground leading-tight">
                ¿Listo para encontrar tu próximo hogar o inversión?
              </h3>
              <p className="mt-2 text-[14px] text-muted">Conversemos. Respondemos en minutos por WhatsApp.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="https://wa.me/573177597155"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[52px] rounded-xl bg-[#25D366] text-white font-body font-semibold text-[15px] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp directo
              </a>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[52px] rounded-xl bg-white text-foreground font-body font-semibold text-[15px] border border-black/10 hover:border-gold hover:text-gold hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Enviar mensaje
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ===== BENTO GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* BRAND CARD */}
          <div className="md:col-span-4 bg-white rounded-2xl p-7 shadow-sm border border-black/5 flex flex-col">
            <Logo height={52} />
            <p className="mt-5 text-[14px] leading-relaxed text-muted">
              En Medellín, ayudando a familias a encontrar su próximo hogar — y a inversionistas su próximo negocio.
            </p>
            <nav aria-label="Redes sociales" className="mt-auto pt-6 flex gap-2.5">
              {socialLinks.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-11 h-11 rounded-full bg-neutral-50 border border-black/5 flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 hover:bg-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icon} /></svg>
                </a>
              ))}
            </nav>
          </div>

          {/* NAVEGAR CARD */}
          <div className="md:col-span-2 bg-white rounded-2xl p-7 shadow-sm border border-black/5">
            <CardHeading>Navegar</CardHeading>
            <ul className="space-y-0.5">
              {navLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-2 py-2 text-[14px] text-muted hover:text-gold transition-colors duration-200 min-h-[36px]"
                  >
                    <span className="w-0 group-hover:w-3 h-[1px] bg-gold transition-all duration-300" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* TIPOS CARD */}
          <div className="md:col-span-3 bg-white rounded-2xl p-7 shadow-sm border border-black/5">
            <CardHeading>Tipos de inmueble</CardHeading>
            <ul className="space-y-0.5">
              {propertyTypes.map(({ label, id, icon }) => (
                <li key={label}>
                  <Link
                    href={`/propiedades?propiedad=${id}`}
                    className="group flex items-center gap-2.5 py-2 text-[14px] text-muted hover:text-gold transition-colors duration-200 min-h-[36px]"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-md bg-neutral-50 border border-black/5 text-muted/70 group-hover:border-gold/40 group-hover:text-gold group-hover:bg-gold/5 transition-all duration-300">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {icon}
                      </svg>
                    </span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* HABLEMOS CARD · HIGHLIGHTED */}
          <address className="md:col-span-3 not-italic bg-white rounded-2xl p-7 shadow-md border border-gold/25 ring-1 ring-gold/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold/10 to-transparent pointer-events-none" aria-hidden="true" />
            <CardHeading>Hablemos</CardHeading>
            <ul className="space-y-0.5 relative">
              <li className="flex items-start gap-2.5 py-2 text-[14px] text-muted min-h-[36px]">
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md bg-gold/10 border border-gold/20 text-gold mt-[1px]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className="leading-snug">Cra 77 #36-31,<br className="hidden sm:inline" /> Laureles, Medellín</span>
              </li>

              <li>
                <a
                  href="tel:+576043220207"
                  className="group flex items-center gap-2.5 py-2 text-[14px] text-muted hover:text-gold transition-colors duration-200 min-h-[36px]"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md bg-gold/10 border border-gold/20 text-gold group-hover:border-gold/50 group-hover:bg-gold/15 transition-all duration-300">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  604 322 0207
                </a>
              </li>

              <li>
                <a
                  href="https://wa.me/573177597155"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 py-2 text-[14px] text-muted hover:text-[#25D366] transition-colors duration-200 min-h-[36px]"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] group-hover:border-[#25D366]/50 group-hover:bg-[#25D366]/15 transition-all duration-300">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </span>
                  317 759 7155
                </a>
              </li>

              <li>
                <a
                  href="mailto:gerencia@indubienes.com"
                  className="group flex items-center gap-2.5 py-2 text-[14px] text-muted hover:text-gold transition-colors duration-200 min-h-[36px]"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md bg-gold/10 border border-gold/20 text-gold group-hover:border-gold/50 group-hover:bg-gold/15 transition-all duration-300">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <span className="truncate">gerencia@indubienes.com</span>
                </a>
              </li>
            </ul>
          </address>
        </div>

        {/* ===== BOTTOM BAR ===== */}
        <div className="mt-10 pt-6 border-t border-black/5 space-y-3">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px]">
            <Link href="/politica-privacidad" className="text-faint hover:text-gold transition-colors py-1">Política de Privacidad</Link>
            <span className="text-faint/40" aria-hidden="true">·</span>
            <Link href="/autorizacion-datos" className="text-faint hover:text-gold transition-colors py-1">Autorización de Datos</Link>
            <span className="text-faint/40" aria-hidden="true">·</span>
            <Link href="/politica-privacidad#cookies" className="text-faint hover:text-gold transition-colors py-1">Política de Cookies</Link>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-1.5 text-center">
            <p className="text-[11px] text-faint tracking-wide">
              © {new Date().getFullYear()} INMOBILIARIA INDUBIENES SAS · NIT 900965649 · Medellín, Colombia
            </p>
            <p className="text-[11px] text-faint tracking-wide">
              Hecho con cariño en Medellín
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

