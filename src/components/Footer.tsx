import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <Logo height={36} />
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-[280px] mb-5">
              Su aliado inmobiliario en Medellín. Venta, arriendo y administración de propiedades.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {[
                { href: 'https://www.facebook.com/Indubienes-1368142806533716/', label: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { href: 'https://twitter.com/indubienes_sas', label: 'Twitter', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { href: 'https://wa.me/573177597155', label: 'WhatsApp', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
              ].map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 transition-all duration-300"
                  aria-label={label}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={icon} /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation — vertical list */}
          <div>
            <h4 className="font-display text-sm text-foreground mb-4 font-bold tracking-wide">Navegación</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Inicio', href: '/' },
                { label: 'Propiedades', href: '/propiedades' },
                { label: 'Venta', href: '/propiedades?tipo=venta' },
                { label: 'Arriendo', href: '/propiedades?tipo=arriendo' },
                { label: 'Contacto', href: '/contacto' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted hover:text-gold transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types — vertical list with working filters */}
          <div>
            <h4 className="font-display text-sm text-foreground mb-4 font-bold tracking-wide">Tipos de Propiedad</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Apartamentos', id: 2 },
                { label: 'Casas', id: 3 },
                { label: 'Apartaestudios', id: 1 },
                { label: 'Locales', id: 4 },
                { label: 'Bodegas', id: 5 },
                { label: 'Fincas', id: 6 },
              ].map(({ label, id }) => (
                <li key={label}>
                  <Link href={`/propiedades?propiedad=${id}`} className="text-sm text-muted hover:text-gold transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — vertical list */}
          <div>
            <h4 className="font-display text-sm text-foreground mb-4 font-bold tracking-wide">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-muted">
                <svg className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                Cra 77 #36-31, Laureles, Medellín
              </li>
              <li>
                <a href="tel:+576043220207" className="flex items-center gap-2.5 text-sm text-muted hover:text-gold transition-colors">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  604 322 0207
                </a>
              </li>
              <li>
                <a href="https://wa.me/573177597155" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-muted hover:text-gold transition-colors">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  317 759 7155
                </a>
              </li>
              <li>
                <a href="mailto:gerencia@indubienes.com" className="flex items-center gap-2.5 text-sm text-muted hover:text-gold transition-colors">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  gerencia@indubienes.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-2 text-center">
          <p className="text-[11px] sm:text-xs text-faint sm:tracking-wide">
            © {new Date().getFullYear()} INMOBILIARIA INDUBIENES SAS · NIT 900965649
          </p>
          <p className="text-[11px] sm:text-xs text-faint sm:tracking-wide">
            Medellín, Colombia · Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
