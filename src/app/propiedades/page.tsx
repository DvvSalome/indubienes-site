import { searchProperties, getPropertyTypes } from '@/lib/wasi';
import PropertiesClient from './PropertiesClient';

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

  return (
    <div className="pt-20 sm:pt-24">
      {/* Page header */}
      <div className="bg-surface px-4 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <p className="text-gold text-sm font-body tracking-[0.2em] uppercase mb-2">Explorar</p>
          <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-2">
            {searchParams.tipo === 'arriendo' ? 'Propiedades en Arriendo' : searchParams.tipo === 'venta' ? 'Propiedades en Venta' : 'Todas las Propiedades'}
          </h1>
          <p className="text-muted font-body">
            {result.total} {result.total === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          </p>
        </div>
      </div>

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
