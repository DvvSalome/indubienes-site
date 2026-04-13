'use client';

import Link from 'next/link';
import Image from 'next/image';
import { WasiNews } from '@/lib/types';
import { slugifyNewsTitle } from '@/lib/wasi';

interface Props {
  post: WasiNews;
  priority?: boolean;
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

/** Strip emoji (surrogate pairs + dingbats) for clean card text */
function cleanText(text: string): string {
  return text
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/[\u2600-\u27BF\uFE00-\uFEFF]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Convention-based image resolution:
 *   1. /blog/{id_news}.jpg  — high-res local image (uploaded via admin)
 *   2. WASI news image      — fallback (low-res CDN thumbnail)
 *   3. /logo-hd.png         — last resort placeholder
 *
 * The admin panel uploads images as {id_news}.jpg automatically.
 * No hardcoded map needed — just match by post ID.
 */
function resolveImage(post: WasiNews): { src: string; isLocal: boolean } {
  // Convention: /blog/{id_news}.jpg
  const localPath = `/blog/${post.id_news}.jpg`;
  return { src: localPath, isLocal: true };
}

export default function BlogCard({ post, priority = false }: Props) {
  const slug = `${post.id_news}-${slugifyNewsTitle(post.title)}`;
  const href = `/blog/${slug}`;
  const { src: imageSrc, isLocal } = resolveImage(post);
  const wasiImage = post.image || '/logo-hd.png';
  const date = formatSpanishDate(post.date);
  const isWasi = !isLocal;
  const abstract = cleanText(post.abstract || '');

  return (
    <Link
      href={href}
      className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5 hover:-translate-y-1.5 transition-all duration-500"
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden">
        {/* Dark overlay gradient for depth */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div
          className={
            isWasi
              ? 'absolute inset-0 scale-[2.1] origin-center transition-transform duration-700 ease-out group-hover:scale-[2.25]'
              : 'absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.05]'
          }
        >
          <Image
            src={imageSrc}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            quality={92}
            className="object-cover"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            onError={(e) => {
              // If local image doesn't exist, fall back to WASI
              const img = e.target as HTMLImageElement;
              if (img.src !== wasiImage && !img.src.includes('wasi.co')) {
                img.src = wasiImage;
              }
            }}
          />
        </div>

        {/* Date badge over image */}
        {date && (
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-block px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-700 shadow-sm">
              {date}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <h3 className="font-display font-bold text-lg sm:text-xl text-foreground leading-snug mb-3 line-clamp-2 group-hover:text-gold transition-colors duration-300">
          {post.title}
        </h3>

        {abstract && (
          <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-5">
            {abstract}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
          <span className="text-sm font-semibold text-gold tracking-wide group-hover:tracking-wider transition-all duration-300">
            Leer artículo
          </span>
          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors duration-300">
            <svg
              className="w-4 h-4 text-gold transition-transform duration-300 group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
