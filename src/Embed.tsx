import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchInput } from './components/SearchInput';
import { CategoryFilter } from './components/CategoryFilter';
import { EntryCard } from './components/EntryCard';
import { WordOfTheDay } from './components/WordOfTheDay';
import type { DictionaryCategory } from './data/irish-dictionary';
import { search, categoryCounts, wordOfTheDay } from './search';

const getDictionary = () => import('./data/irish-dictionary').then(m => m.DICTIONARY_ENTRIES);

export function Embed() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') as DictionaryCategory | null;

  const [entries, setEntries] = useState<Awaited<ReturnType<typeof getDictionary>>>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DictionaryCategory | null>(initialCategory);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void getDictionary().then(e => { setEntries(e); setLoaded(true); });
  }, []);

  const counts = useMemo(() => categoryCounts(entries), [entries]);
  const wotd = useMemo(() => entries.length ? wordOfTheDay(entries) : null, [entries]);
  const results = useMemo(
    () => search(entries, query, { category, limit: 40 }),
    [entries, query, category],
  );

  const showWotd = !query && !category;

  return (
    <div className="flex flex-col h-full min-h-screen bg-dark-900 text-gray-100">
      {/* Compact header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-dark-900/90 backdrop-blur sticky top-0 z-10">
        <span className="text-lg select-none">🍀</span>
        <span className="font-semibold text-sm text-white">Cupla Focail</span>
        <span className="text-gray-600 text-xs ml-1">Irish-English Dictionary</span>
        <a
          href="/"
          target="_top"
          className="ml-auto text-xs text-shamrock-500 hover:text-shamrock-300 transition-colors"
        >
          Open full site ↗
        </a>
      </div>

      {/* Search */}
      <div className="px-4 pt-4 pb-3">
        <SearchInput value={query} onChange={setQuery} autoFocus />
      </div>

      {/* Category chips */}
      {loaded && (
        <div className="px-4 pb-3">
          <CategoryFilter selected={category} onChange={setCategory} counts={counts} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {!loaded && (
          <div className="flex justify-center pt-12">
            <div className="w-6 h-6 border-2 border-shamrock-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {loaded && showWotd && wotd && (
          <div className="mb-4">
            <WordOfTheDay entry={wotd} />
          </div>
        )}

        {loaded && (query || category) && (
          <>
            <p className="text-xs text-gray-600 mb-3" aria-live="polite">
              {results.total} result{results.total !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-col gap-2">
              {results.entries.map(entry => (
                <EntryCard key={entry.id} entry={entry} query={query} />
              ))}
            </div>
            {results.total === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No results for "{query}"</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer attribution */}
      <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-gray-700">
          Powered by{' '}
          <a href="/" target="_top" className="text-shamrock-700 hover:text-shamrock-500 transition-colors">
            cuplafocail.ie
          </a>
        </span>
        <span className="text-xs text-gray-700">{entries.length.toLocaleString()} entries</span>
      </div>
    </div>
  );
}
