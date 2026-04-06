import { searchProperties, getPropertyTypes } from '@/lib/wasi';
import PropertiesClient from './PropertiesClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: {
    tipo?: string;
    propiedad?: string;
    minPrecio?: string;
    maxPrecio?: string;
    habitaciones?: string;
    banos?: string;
    page?: string;
  };
}

export default async function PropiedadesPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1', 10);
  const take = 12;
  const skip = (page - 1) * take;

  const filters: Record<string, unknown> = { skip, take };

  if (searchParams.tipo === 'venta') filters.for_sale = true;
  if (searchParams.tipo === 'arriendo') filters.for_rent = true;
  if (searchParams.propiedad) filters.id_property_type = parseInt(searchParams.propiedad, 10);
  if (searchParams.minPrecio) filters.min_price = parseInt(searchParams.minPrecio, 10);
  if (searchParams.maxPrecio) filters.max_price = parseInt(searchParams.maxPrecio, 10);
  if (searchParams.habitaciones) filters.min_bedrooms = parseInt(searchParams.habitaciones, 10);
  if (searchParams.banos) filters.bathrooms = parseInt(searchParams.banos, 10);

  const [result, propertyTypes] = await Promise.all([
    searchProperties(filters),
    getPropertyTypes(),
  ]);

  const pageTitle = searchParams.tipo === 'arriendo'
    ? 'Propiedades en Arriendo'
    : searchParams.tipo === 'venta'
    ? 'Propiedades en Venta'
    : 'Todas las Propiedades';

  return (
    <div className="pt-20 sm:pt-24">
      {/* Mini-hero banner */}
      <section className="relative h-[220px] sm:h-[280px] flex items-end overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1633627425472-d07ac65e2a36?w=1920&h=600&fit=crop&q=80')`,
          }}
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(13,13,13,0.35) 0%, rgba(13,13,13,0.65) 50%, rgba(13,13,13,0.88) 100%)',
          }}
        />
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-6 lg:px-8 pb-8 sm:pb-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] sm:text-xs font-body text-white/50 mb-4 tracking-wide">
            <Link href="/" className="hover:text-white/80 transition-colors">Inicio</Link>
            <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/70">Propiedades</span>
          </nav>

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white mb-2 leading-tight"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
          >
            {pageTitle}
          </h1>

          {/* Counter badge */}
          <div className="flex items-center gap-2">
            <span className="inline-block w-8 h-[2px] bg-gold/80 rounded-full" />
            <p className="text-white/60 text-sm font-body">
              {result.total} {result.total === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
            </p>
          </div>
        </div>
      </section>

      <PropertiesClient
        initialProperties={result.properties}
        total={result.total}
        propertyTypes={propertyTypes}
        currentPage={page}
        searchParams={searchParams}
      />
    </div>
  );
}
