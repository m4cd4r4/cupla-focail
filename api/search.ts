// Edge Function — esbuild bundles TypeScript imports at build time, no Node.js fs needed
export const config = { runtime: 'edge' };

import { DICTIONARY_ENTRIES } from '../src/data/irish-dictionary';
import { search, categoryCounts, wordOfTheDay, findById } from '../src/search';
import type { DictionaryCategory } from '../src/data/irish-dictionary';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=3600',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export default function handler(request: Request): Response {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/word-of-the-day') {
    return json({ entry: wordOfTheDay(DICTIONARY_ENTRIES) });
  }

  const entryMatch = path.match(/^\/api\/entry\/(.+)$/);
  if (entryMatch) {
    const entry = findById(DICTIONARY_ENTRIES, decodeURIComponent(entryMatch[1]));
    if (!entry) return json({ error: 'Not found' }, 404);
    return json({ entry });
  }

  if (path === '/api/categories') {
    return json({ categories: categoryCounts(DICTIONARY_ENTRIES), total: DICTIONARY_ENTRIES.length });
  }

  // Default: /api/search
  const q     = (url.searchParams.get('q') ?? '').trim();
  const cat   = url.searchParams.get('category') ?? '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10) || 20, 200);

  const category = (cat || null) as DictionaryCategory | null;
  return json(search(DICTIONARY_ENTRIES, q, { category, limit }));
}
