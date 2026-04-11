import Link from 'next/link';
import Image from 'next/image';
import { WasiNews } from '@/lib/types';
import { slugifyNewsTitle } from '@/lib/wasi';

interface Props {
  post: WasiNews;
  priority?: boolean;
}

function formatSpanishDate(iso: string): string {
  // "2026-03-10" → "10 de marzo de 2026"
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${d} de ${months[m - 1]} de ${y}`;
}

export default function BlogCard({ post, priority = false }: Props) {
  const slug = `${post.id_news}-${slugifyNewsTitle(post.title)}`;
  const href = `/blog/${slug}`;
  const image = post.image || '/logo-hd.png';
  const date = formatSpanishDate(post.date);
  // WASI thumbnails have white side-bars baked into the image file.
  // We can't trim them server-side without adding deps, so we zoom the
  // image inside overflow-hidden to push the bars out of view.
  const isWasi = image.includes('wasi.co');

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[16/9] bg-neutral-100 overflow-hidden">
        <div
          className={
            isWasi
              ? 'absolute inset-0 scale-[2.1] origin-center transition-transform duration-700 group-hover:scale-[2.2]'
              : 'absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]'
          }
        >
          <Image
            src={image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            quality={92}
            className="object-cover"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
          />
        </div>
      </div>
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {date && (
          <p className="text-[11px] uppercase tracking-[0.15em] text-gold font-semibold mb-2">
            {date}
          </p>
        )}
        <h3 className="font-display font-bold text-lg sm:text-xl text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-gold transition-colors duration-300">
          {post.title}
        </h3>
        <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-4">
          {post.abstract}
        </p>
        <div className="mt-auto flex items-center gap-2 text-sm font-medium text-gold">
          <span>Leer más</span>
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
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
    </Link>
  );
}
