import type { DictionaryEntry, DictionaryCategory } from './data/irish-dictionary';

export interface SearchOptions {
  /** Category to filter by. Null = all categories. */
  category?: DictionaryCategory | null;
  /** Max results to return. Default: 50. */
  limit?: number;
}

export interface SearchResult {
  entries: DictionaryEntry[];
  total: number;
  query: string;
  normalizedQuery: string;
}

/** Strip fadas (Irish diacritics) for fuzzy matching. */
export function normalizeIrish(text: string): string {
  return text
    .toLowerCase()
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u');
}

/**
 * Search the dictionary for entries matching a query.
 * Searches both Irish and English, fada-insensitive.
 */
export function search(
  entries: DictionaryEntry[],
  query: string,
  options: SearchOptions = {},
): SearchResult {
  const { category = null, limit = 50 } = options;
  const q = normalizeIrish(query.trim());

  let pool = category ? entries.filter((e) => e.category === category) : entries;

  if (!q) {
    const slice = pool.slice(0, limit);
    return { entries: slice, total: pool.length, query, normalizedQuery: q };
  }

  const matched = pool.filter((e) =>
    e.searchTerms.some((term) => term.includes(q)),
  );

  return {
    entries: matched.slice(0, limit),
    total: matched.length,
    query,
    normalizedQuery: q,
  };
}

/**
 * Count entries per category.
 */
export function categoryCounts(
  entries: DictionaryEntry[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    counts[entry.category] = (counts[entry.category] ?? 0) + 1;
  }
  return counts;
}

/**
 * Returns a deterministic word-of-the-day based on today's date.
 */
export function wordOfTheDay(entries: DictionaryEntry[]): DictionaryEntry {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86_400_000,
  );
  return entries[dayOfYear % entries.length];
}

/**
 * Look up a single entry by its id.
 */
export function findById(
  entries: DictionaryEntry[],
  id: string,
): DictionaryEntry | undefined {
  return entries.find((e) => e.id === id);
}

/**
 * Look up entries by exact English word (case-insensitive).
 */
export function findByEnglish(
  entries: DictionaryEntry[],
  english: string,
): DictionaryEntry[] {
  const q = english.toLowerCase();
  return entries.filter(
    (e) =>
      e.english.toLowerCase() === q ||
      e.englishAlt?.some((a) => a.toLowerCase() === q),
  );
}

/**
 * Look up entries by exact Irish word (fada-insensitive).
 */
export function findByIrish(
  entries: DictionaryEntry[],
  irish: string,
): DictionaryEntry[] {
  const q = normalizeIrish(irish);
  return entries.filter((e) => normalizeIrish(e.irish) === q);
}
