import { getProperty } from '@/lib/wasi';
import { formatPrice } from '@/lib/wasi';
import { notFound } from 'next/navigation';
import PropertyDetailClient from './PropertyDetailClient';

interface Props {
  params: { id: string };
}

export default async function PropertyDetailPage({ params }: Props) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  const property = await getProperty(id);
  if (!property) notFound();

  return <PropertyDetailClient property={property} />;
}
