import type { Metadata } from 'next';
import Link from 'next/link';
import { searchNews } from '@/lib/wasi';
import BlogCard from '@/components/BlogCard';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;
const SITE_URL = 'https://indubienes-site.vercel.app';

export async function generateMetadata(): Promise<Metadata> {
  // Pull latest post so og:image can be a real photo, not the logo.
  let ogImage = `${SITE_URL}/logo-hd.png`;
  let ogAlt = 'Indubienes - Blog Inmobiliario';
  try {
    const { news } = await searchNews({ skip: 0, take: 1 });
    if (news[0]?.image) {
      ogImage = news[0].image;
      ogAlt = news[0].title || ogAlt;
    }
  } catch {
    // fall back to logo
  }

  return {
    title: 'Blog Inmobiliario',
    description:
      'Consejos, guías y noticias sobre el mercado inmobiliario en Medellín. Aprende a invertir, vender y comprar propiedades con Indubienes.',
    alternates: { canonical: '/blog' },
    openGraph: {
      title: 'Blog Inmobiliario | Indubienes',
      description:
        'Consejos, guías y noticias sobre el mercado inmobiliario en Medellín.',
      url: `${SITE_URL}/blog`,
      type: 'website',
      locale: 'es_CO',
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog Inmobiliario | Indubienes',
      description:
        'Consejos, guías y noticias sobre el mercado inmobiliario en Medellín.',
      images: [ogImage],
    },
  };
}

interface Props {
  searchParams: { page?: string };
}

export default async function BlogPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const { news, total } = await searchNews({ skip, take: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog Indubienes',
    description:
      'Consejos, guías y noticias sobre el mercado inmobiliario en Medellín.',
    url: `${SITE_URL}/blog`,
    publisher: {
      '@type': 'RealEstateAgent',
      name: 'Indubienes',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-hd.png`,
      },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
    ],
  };

  return (
    <div className="pt-20 sm:pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Mini-hero banner */}
      <section className="relative h-[220px] sm:h-[280px] flex items-end overflow-hidden bg-neutral-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/videos/medellin-poster.jpg')` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(13,13,13,0.45) 0%, rgba(13,13,13,0.7) 50%, rgba(13,13,13,0.9) 100%)',
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-6 lg:px-8 pb-8 sm:pb-10">
          <nav className="flex items-center gap-2 text-[11px] sm:text-xs font-body text-white/50 mb-4 tracking-wide">
            <Link href="/" className="hover:text-white/80 transition-colors">
              Inicio
            </Link>
            <svg
              className="w-3 h-3 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/70">Blog</span>
          </nav>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white mb-2 leading-tight"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
          >
            Blog Inmobiliario
          </h1>
          <div className="flex items-center gap-2">
            <span className="inline-block w-8 h-[2px] bg-gold/80 rounded-full" />
            <p className="text-white/60 text-sm font-body">
              {total > 0
                ? `${total} ${total === 1 ? 'publicación' : 'publicaciones'} para invertir con confianza`
                : 'Pronto publicaremos contenido sobre el mercado inmobiliario'}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
        {news.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg">
              Aún no hay publicaciones. Vuelve pronto.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {news.map((post, idx) => (
                <BlogCard key={post.id_news} post={post} priority={idx < 3} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-2 sm:gap-3">
                {page > 1 && (
                  <Link
                    href={`/blog?page=${page - 1}`}
                    className="px-4 py-2 rounded-full border border-gold/30 text-gold hover:bg-gold hover:text-white transition-colors text-sm font-medium"
                  >
                    ← Anterior
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-muted">
                  Página {page} de {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/blog?page=${page + 1}`}
                    className="px-4 py-2 rounded-full border border-gold/30 text-gold hover:bg-gold hover:text-white transition-colors text-sm font-medium"
                  >
                    Siguiente →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
