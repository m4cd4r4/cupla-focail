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
  const posLabel = POS_LABELS[entry.partOfSpeech] ?? entry.partOfSpeech;
  const genderLabel = entry.gender ? GENDER_LABELS[entry.gender] : null;

  return (
    <div className="glass glass-hover rounded-xl p-4 animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-shamrock-300 tracking-wide">
            {highlight(entry.irish, query)}
          </p>
          <p className="text-gray-100 mt-0.5">
            {highlight(entry.english, query)}
            {entry.englishAlt && entry.englishAlt.length > 0 && (
              <span className="text-gray-500 text-sm ml-2">
                · {entry.englishAlt.join(', ')}
              </span>
            )}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-xs text-gray-500 italic">{posLabel}</span>
          {genderLabel && (
            <span className="ml-1.5 text-xs text-gold-500">{genderLabel}</span>
          )}
        </div>
      </div>
    </div>
  );
}
