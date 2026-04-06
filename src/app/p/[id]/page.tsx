import { Metadata } from 'next';
import { getProperty, formatPrice } from '@/lib/wasi';
import FunnelClient from './FunnelClient';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await getProperty(Number(params.id));
  if (!property) {
    return {
      title: 'Propiedad no encontrada',
      description: 'La propiedad que buscas no está disponible.'
    };
  }

  const price = property.sale_price ? formatPrice(property.sale_price) : formatPrice(property.rent_price);
  const type = property.for_sale ? 'Venta' : 'Arriendo';
  const title = `${property.property_type_label} en ${type} - ${property.location_label || property.city_label}`;
  const description = `${property.property_type_label} de ${property.area}m² con ${property.bedrooms} hab. ${property.bathrooms} baños. ${price}. ${property.location_label}, ${property.city_label}.`;
  const image = property.main_image?.url_big || property.main_image?.url;

  return {
    title: `${title} | Indubienes`,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
      type: 'website',
      siteName: 'Indubienes - Inmobiliaria Premium',
      locale: 'es_CO',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function FunnelPage({ params }: Props) {
  const property = await getProperty(Number(params.id));

  if (!property) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Propiedad no encontrada</h1>
          <p className="text-[#B0B0B0] mb-8">Lo sentimos, la propiedad que buscas no está disponible.</p>
          <a href="/" className="inline-block bg-[#4A8BC2] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#3B6FA0] transition">
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return <FunnelClient property={property} />;
}
