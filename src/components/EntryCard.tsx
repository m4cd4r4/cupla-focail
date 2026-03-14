import { useState } from 'react';
import type { DictionaryEntry } from '../data/irish-dictionary';

const POS_LABELS: Record<string, string> = {
  noun: 'ainmfhocal', verb: 'briathar', adjective: 'aidiacht',
  adverb: 'dobhriathar', pronoun: 'forainm', preposition: 'réamhfhocal',
  conjunction: 'cónasc', interjection: 'intriacht', phrase: 'frása', number: 'uimhir',
};

const GENDER_LABELS: Record<string, string> = {
  masculine: 'fir.',
  feminine: 'bain.',
};

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  curated:    { label: 'curated',    color: 'text-shamrock-500' },
  lsg:        { label: 'WordNet',    color: 'text-blue-400' },
  wiktionary: { label: 'Wiktionary', color: 'text-purple-400' },
  gramadan:   { label: 'Gramadan',   color: 'text-amber-400' },
  paracrawl:  { label: 'ParaCrawl', color: 'text-cyan-400' },
};

interface Props {
  entry: DictionaryEntry;
  query?: string;
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-shamrock-600/40 text-shamrock-200 rounded px-0.5 not-italic">{part}</mark>
          : part
      )}
    </>
  );
}

export function EntryCard({ entry, query = '' }: Props) {
  const [showInflections, setShowInflections] = useState(false);
  const posLabel = POS_LABELS[entry.partOfSpeech] ?? entry.partOfSpeech;
  const genderLabel = entry.gender ? GENDER_LABELS[entry.gender] : null;
  const sourceInfo = entry.source ? SOURCE_LABELS[entry.source] : null;
  const hasInflections = entry.inflections && entry.inflections.length > 0;

  return (
    <div className="glass glass-hover rounded-xl p-4 animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-lg font-semibold text-shamrock-300 tracking-wide">
              {highlight(entry.irish, query)}
            </p>
            {entry.pronunciation && (
              <span className="text-xs text-gray-500 font-mono">{entry.pronunciation}</span>
            )}
          </div>
          <p className="text-gray-100 mt-0.5">
            {highlight(entry.english, query)}
            {entry.englishAlt && entry.englishAlt.length > 0 && (
              <span className="text-gray-500 text-sm ml-2">
                · {entry.englishAlt.join(', ')}
              </span>
            )}
          </p>
          {hasInflections && (
            <div className="mt-1.5">
              <button
                onClick={() => setShowInflections(v => !v)}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                {showInflections ? '▾ hide forms' : `▸ ${entry.inflections!.length} forms`}
              </button>
              {showInflections && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.inflections!.map(form => (
                    <span key={form} className="text-xs bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-gray-400 font-mono">
                      {form}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right flex flex-col items-end gap-1">
          <span className="text-xs text-gray-500 italic">{posLabel}</span>
          {genderLabel && (
            <span className="text-xs text-gold-500">{genderLabel}</span>
          )}
          {sourceInfo && (
            <span className={`text-xs ${sourceInfo.color} opacity-60`}>{sourceInfo.label}</span>
          )}
        </div>
      </div>
    </div>
  );
}
