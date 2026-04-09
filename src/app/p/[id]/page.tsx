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
  // OG image: prefer raw url_original so WhatsApp/FB previews don't show white letterbox bars.
  const image = property.main_image?.url_original || property.main_image?.url_big || property.main_image?.url;

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Propiedad no encontrada</h1>
          <p className="text-muted mb-8">Lo sentimos, la propiedad que buscas no está disponible.</p>
          <a href="/" className="inline-block bg-gold text-white px-8 py-3 rounded-lg font-semibold hover:bg-gold-hover transition">
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return <FunnelClient property={property} />;
}
