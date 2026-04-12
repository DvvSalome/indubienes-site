// Performance & SEO optimizations applied
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getNews, searchNews, slugifyNewsTitle } from '@/lib/wasi';
import BlogCard from '@/components/BlogCard';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://indubienes-site.vercel.app';

/**
 * Override map: WASI post ID → local AI-generated image.
 * Must stay in sync with BlogCard.tsx LOCAL_IMAGES.
 */
const LOCAL_IMAGES: Record<number, string> = {
  27256: '/blog/blog-laureles.jpg',
  27227: '/blog/blog-inversion.jpg',
};

interface Props {
  params: { slug: string };
}

// Minimal HTML sanitizer — strips scripts, iframes, event handlers and javascript: URLs.
// WASI content comes from the client's own CMS, so this is mainly defense-in-depth.
function sanitizeHtml(html: string): string {
  if (!html) return '';
  let clean = html;
  // Remove script/style/iframe blocks
  clean = clean.replace(/<script[\s\S]*?<\/script>/gi, '');
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, '');
  clean = clean.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  // Strip on* event attributes
  clean = clean.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '');
  clean = clean.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '');
  // Strip javascript: hrefs
  clean = clean.replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"');
  clean = clean.replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'");
  return clean;
}

function parseSlug(slug: string): number | null {
  const match = slug.match(/^(\d+)/);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  return isNaN(id) ? null : id;
}

function formatSpanishDate(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${d} de ${months[m - 1]} de ${y}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseSlug(params.slug);
  if (!id) return { title: 'Publicación no encontrada' };

  const post = await getNews(id);
  if (!post) return { title: 'Publicación no encontrada' };

  const canonicalSlug = `${post.id_news}-${slugifyNewsTitle(post.title)}`;
  const rawDesc =
    post.abstract ||
    post.content.replace(/<[^>]+>/g, '').slice(0, 200).trim();
  // Strip emoji (surrogate pairs), collapse whitespace, limit to 160 chars
  /* eslint-disable no-misleading-character-class */
  const description = rawDesc
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/[\u2600-\u27BF\uFE00-\uFEFF]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 160);
  const localImg = LOCAL_IMAGES[post.id_news];
  const image = localImg || post.image || '/logo-hd.png';

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${canonicalSlug}` },
    openGraph: {
      title: `${post.title} | Indubienes`,
      description,
      url: `${SITE_URL}/blog/${canonicalSlug}`,
      type: 'article',
      locale: 'es_CO',
      images: [
        {
          url: image.startsWith('http') ? image : `${SITE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const id = parseSlug(params.slug);
  if (!id) notFound();

  const post = await getNews(id);
  if (!post) notFound();

  const safeHtml = sanitizeHtml(post.content);
  const date = formatSpanishDate(post.date);
  const localImg = LOCAL_IMAGES[post.id_news];
  const image = localImg || post.image || '/logo-hd.png';
  const isWasi = !localImg && image.includes('wasi.co');

  // Related posts
  const related = await searchNews({ skip: 0, take: 6 });
  const relatedPosts = related.news
    .filter((p) => p.id_news !== post.id_news)
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.abstract,
    image: image.startsWith('http') ? image : `${SITE_URL}${image}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'Indubienes',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Indubienes',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-hd.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.id_news}-${slugifyNewsTitle(post.title)}`,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.id_news}-${slugifyNewsTitle(post.title)}`,
      },
    ],
  };

  return (
    <div className="pt-20 sm:pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <section className="relative h-[320px] sm:h-[420px] md:h-[480px] overflow-hidden bg-neutral-900">
        <div
          className={
            isWasi
              ? 'absolute inset-0 scale-[1.6] origin-center'
              : 'absolute inset-0'
          }
        >
          <Image
            src={image}
            alt={post.title}
            fill
            priority
            quality={92}
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(13,13,13,0.35) 0%, rgba(13,13,13,0.6) 50%, rgba(13,13,13,0.92) 100%)',
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto w-full px-5 sm:px-6 lg:px-8 pb-10 sm:pb-14 h-full flex flex-col justify-end">
          <nav className="flex items-center gap-2 text-[11px] sm:text-xs font-body text-white/50 mb-4 tracking-wide">
            <Link href="/" className="hover:text-white/80 transition-colors">
              Inicio
            </Link>
            <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/blog" className="hover:text-white/80 transition-colors">
              Blog
            </Link>
            <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/70 truncate max-w-[200px]">{post.title}</span>
          </nav>
          {date && (
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold mb-3">
              {date}
            </p>
          )}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white leading-tight max-w-3xl"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
          >
            {post.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
        {post.abstract && (
          <p className="text-lg sm:text-xl text-foreground/80 leading-relaxed mb-8 font-body italic border-l-4 border-gold pl-5">
            {post.abstract}
          </p>
        )}
        <div
          className="blog-content prose prose-lg max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />

        {/* Share + CTA */}
        <div className="mt-12 pt-8 border-t border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-hover font-medium transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver al blog
          </Link>
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white rounded-full font-medium hover:bg-gold-hover transition-colors shadow-lg shadow-gold/20"
          >
            Ver propiedades disponibles
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-neutral-50 border-t border-black/5 py-16">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-8 text-center">
              También te puede interesar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedPosts.map((p) => (
                <BlogCard key={p.id_news} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
