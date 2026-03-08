import type { VercelRequest, VercelResponse } from '@vercel/node';
// .js extensions required for nodenext moduleResolution — esbuild resolves these to .ts files
import { DICTIONARY_ENTRIES } from '../src/data/irish-dictionary.js';
import { search, categoryCounts, wordOfTheDay, findById } from '../src/search.js';

function cors(res: VercelResponse): VercelResponse {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=3600');
  return res;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    cors(res).status(204).end();
    return;
  }

  const rawUrl = req.url ?? '/api/search';
  const url = new URL(rawUrl, 'https://focloir.vercel.app');
  const path = url.pathname;

  // GET /api/word-of-the-day
  if (path === '/api/word-of-the-day') {
    cors(res).status(200).json({ entry: wordOfTheDay(DICTIONARY_ENTRIES) });
    return;
  }

  // GET /api/entry/:id
  const entryMatch = path.match(/^\/api\/entry\/(.+)$/);
  if (entryMatch) {
    const id = decodeURIComponent(entryMatch[1]);
    const entry = findById(DICTIONARY_ENTRIES, id);
    if (!entry) { cors(res).status(404).json({ error: 'Not found' }); return; }
    cors(res).status(200).json({ entry });
    return;
  }

  // GET /api/categories
  if (path === '/api/categories') {
    cors(res).status(200).json({
      categories: categoryCounts(DICTIONARY_ENTRIES),
      total: DICTIONARY_ENTRIES.length,
    });
    return;
  }

  // GET /api/search (default)
  const q     = ((req.query['q']       as string) ?? '').trim();
  const cat   = (req.query['category'] as string) ?? '';
  const limit = Math.min(parseInt((req.query['limit'] as string) ?? '20', 10) || 20, 200);

  const result = search(DICTIONARY_ENTRIES, q, { category: cat || null, limit });
  cors(res).status(200).json(result);
}
