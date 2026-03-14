// Node.js serverless function — JSON loaded once, cached between warm invocations
import type { VercelRequest, VercelResponse } from '@vercel/node';
import rawEntries from '../src/data/irish-dictionary-data.json';

interface Entry {
  id: string; irish: string; english: string; englishAlt?: string[];
  partOfSpeech: string; category: string; gender?: string; searchTerms: string[];
  source?: string; pronunciation?: string; inflections?: string[]; synonymIds?: string[];
}

const ENTRIES = rawEntries as unknown as Entry[];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
};

function sendJson(res: VercelResponse, data: unknown, status = 200) {
  res.status(status);
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.setHeader(k, v);
  res.json(data);
}

function normalize(t: string) {
  return t.toLowerCase()
    .replace(/á/g, 'a').replace(/é/g, 'e')
    .replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
}

function doSearch(
  entries: Entry[],
  query: string,
  category: string | null,
  source: string | null,
  limit: number,
) {
  const q = normalize(query.trim());
  let pool = category ? entries.filter(e => e.category === category) : entries;
  if (source) {
    const sources = source.split(',').map(s => s.trim());
    pool = pool.filter(e => e.source && sources.includes(e.source));
  }
  if (!q) return { entries: pool.slice(0, limit), total: pool.length, query };
  const matched = pool.filter(e => e.searchTerms.some(t => t.includes(q)));
  return { entries: matched.slice(0, limit), total: matched.length, query };
}

function wordOfTheDay(entries: Entry[]) {
  const day = Math.floor(Date.now() / 86_400_000);
  return entries[day % entries.length];
}

function categoryCounts(entries: Entry[]) {
  const counts: Record<string, number> = {};
  for (const e of entries) counts[e.category] = (counts[e.category] ?? 0) + 1;
  return counts;
}

function sourceCounts(entries: Entry[]) {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    const s = e.source ?? 'curated';
    counts[s] = (counts[s] ?? 0) + 1;
  }
  return counts;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    for (const [k, v] of Object.entries(CORS_HEADERS)) res.setHeader(k, v);
    res.status(204).end();
    return;
  }

  // req.url is the original request path (e.g. /api/word-of-the-day)
  const rawUrl = req.url ?? '/api/search';
  const path = rawUrl.split('?')[0];

  if (path === '/api/word-of-the-day') {
    return sendJson(res, { entry: wordOfTheDay(ENTRIES) });
  }

  const entryMatch = path.match(/^\/api\/entry\/(.+)$/);
  if (entryMatch) {
    const entry = ENTRIES.find(e => e.id === decodeURIComponent(entryMatch[1]));
    if (!entry) return sendJson(res, { error: 'Not found' }, 404);
    return sendJson(res, { entry });
  }

  if (path === '/api/categories') {
    return sendJson(res, { categories: categoryCounts(ENTRIES), total: ENTRIES.length });
  }

  if (path === '/api/sources') {
    return sendJson(res, { sources: sourceCounts(ENTRIES), total: ENTRIES.length });
  }

  // Default: search
  const q = String(req.query.q ?? '').trim();
  const cat = String(req.query.category ?? '');
  const src = String(req.query.source ?? '');
  const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 200);

  return sendJson(res, doSearch(ENTRIES, q, cat || null, src || null, limit));
}
