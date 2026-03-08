import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DICTIONARY_ENTRIES } from '../src/data/irish-dictionary';
import { search, categoryCounts, wordOfTheDay, findById } from '../src/search';
import type { DictionaryCategory } from '../src/data/irish-dictionary';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=3600',
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).set(CORS).end();
  }

  const url = new URL(req.url ?? '/', 'https://focloir.vercel.app');
  const path = url.pathname;

  // ── GET /api/word-of-the-day ──────────────────────────────────────────
  if (path === '/api/word-of-the-day') {
    const entry = wordOfTheDay(DICTIONARY_ENTRIES);
    return res.status(200).set(CORS).json({ entry });
  }

  // ── GET /api/entry/:id ────────────────────────────────────────────────
  const entryMatch = path.match(/^\/api\/entry\/(.+)$/);
  if (entryMatch) {
    const id = decodeURIComponent(entryMatch[1]);
    const entry = findById(DICTIONARY_ENTRIES, id);
    if (!entry) return res.status(404).set(CORS).json({ error: 'Not found' });
    return res.status(200).set(CORS).json({ entry });
  }

  // ── GET /api/categories ───────────────────────────────────────────────
  if (path === '/api/categories') {
    const counts = categoryCounts(DICTIONARY_ENTRIES);
    return res.status(200).set(CORS).json({ categories: counts, total: DICTIONARY_ENTRIES.length });
  }

  // ── GET /api/search ───────────────────────────────────────────────────
  const q = (url.searchParams.get('q') ?? '').trim();
  const category = (url.searchParams.get('category') ?? '') as DictionaryCategory | '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10) || 20, 200);

  const result = search(
    DICTIONARY_ENTRIES,
    q,
    { category: category || null, limit },
  );

  return res.status(200).set(CORS).json(result);
}
