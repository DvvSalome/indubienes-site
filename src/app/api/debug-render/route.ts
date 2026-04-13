import { NextResponse } from 'next/server';
import { getHighlightedProperties, searchNews } from '@/lib/wasi';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, unknown> = {};
  
  try {
    const props = await getHighlightedProperties();
    results.properties = { count: props.length, ok: true };
  } catch (e: unknown) {
    results.properties = { error: String(e), stack: (e as Error)?.stack?.slice(0, 500) };
  }

  try {
    const news = await searchNews({ skip: 0, take: 3 });
    results.news = { count: news.news.length, total: news.total, ok: true };
    if (news.news.length > 0) {
      results.firstPost = {
        id: news.news[0].id_news,
        title: news.news[0].title?.slice(0, 50),
        image: news.news[0].image?.slice(0, 80),
        date: news.news[0].date,
      };
    }
  } catch (e: unknown) {
    results.news = { error: String(e), stack: (e as Error)?.stack?.slice(0, 500) };
  }

  return NextResponse.json(results);
}
