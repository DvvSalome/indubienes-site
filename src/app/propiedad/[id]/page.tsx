import type { Metadata } from 'next';
import { getProperty } from '@/lib/wasi';
import { notFound } from 'next/navigation';
import PropertyDetailClient from './PropertyDetailClient';

interface Props {
  params: { id: string };
}

const SITE_URL = 'https://indubienes-site.vercel.app';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return { title: 'Propiedad no encontrada' };
  }
  const property = await getProperty(id);
  if (!property) {
    return { title: 'Propiedad no encontrada' };
  }

  // WASI property type ID → human label (fallback when property_type_label is empty)
  const TYPE_LABELS: Record<number, string> = {
    1: 'Casa',
    2: 'Apartamento',
    3: 'Local',
    4: 'Oficina',
    5: 'Lote',
    7: 'Finca',
    8: 'Bodega',
    11: 'Casa Lote',
    14: 'Apartaestudio',
    20: 'Apartamento Duplex',
    29: 'Habitación',
  };

  const tipo = property.for_sale ? 'Venta' : property.for_rent ? 'Arriendo' : '';
  const zona = property.zone_label || property.city_label || 'Medellín';
  const precio = property.for_sale
    ? property.sale_price_label
    : property.rent_price_label;

  const typeLabel =
    property.property_type_label ||
    TYPE_LABELS[property.id_property_type as number] ||
    'Propiedad';

  // Prefer real property.title when it exists (WASI returns empty property_type_label often).
  const rawTitle = property.title
    ? property.title
    : `${tipo} ${typeLabel} en ${zona}`;
  const title = rawTitle.length > 60 ? rawTitle.slice(0, 57) + '...' : rawTitle;

  const descParts: string[] = [];
  if (property.bedrooms) descParts.push(`${property.bedrooms} hab`);
  if (property.bathrooms) descParts.push(`${property.bathrooms} baños`);
  if (property.built_area) descParts.push(`${property.built_area} m²`);
  if (property.garages) descParts.push(`${property.garages} parq`);
  const specs = descParts.join(', ');
  const baseDesc = `${tipo} de ${typeLabel.toLowerCase()} en ${zona}. ${specs}. ${precio ? `Precio: ${precio}.` : ''} Indubienes.`;
  const description = baseDesc.length > 155 ? baseDesc.slice(0, 152) + '...' : baseDesc;

  const canonicalPath = `/propiedad/${id}`;
  const imageUrl = property.main_image?.url || `${SITE_URL}/logo-hd.png`;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      type: 'website',
      locale: 'es_CO',
      images: [{ url: imageUrl, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  const property = await getProperty(id);
  if (!property) notFound();

  // JSON-LD Product/Offer schema for this property
  const isForSale = property.for_sale;
  const price = isForSale ? property.sale_price : property.rent_price;
  const priceCurrency = 'COP';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/propiedad/${id}#product`,
    name: `${property.property_type_label || 'Propiedad'} en ${property.zone_label || property.city_label || 'Medellín'}`,
    description: property.observations || `${property.property_type_label} en ${property.zone_label || property.city_label}`,
    image: property.main_image?.url ? [property.main_image.url] : [`${SITE_URL}/logo-hd.png`],
    brand: { '@type': 'Organization', name: 'Indubienes' },
    category: property.property_type_label,
    ...(price > 0 && {
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/propiedad/${id}`,
        priceCurrency,
        price: price.toString(),
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'RealEstateAgent',
          name: 'Indubienes',
          '@id': `${SITE_URL}/#organization`,
        },
      },
    }),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Propiedades', item: `${SITE_URL}/propiedades` },
      {
        '@type': 'ListItem',
        position: 3,
        name: property.title || `${property.property_type_label || 'Propiedad'} en ${property.zone_label || 'Medellín'}`,
        item: `${SITE_URL}/propiedad/${id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PropertyDetailClient property={property} />
    </>
  );
}
