import type { DictionaryEntry } from '../data/irish-dictionary';

const POS_LABELS: Record<string, string> = {
  noun: 'ainmfhocal', verb: 'briathar', adjective: 'aidiacht',
  adverb: 'dobhriathar', pronoun: 'forainm', preposition: 'réamhfhocal',
  conjunction: 'cónasc', interjection: 'intriacht', phrase: 'frása', number: 'uimhir',
};

interface Props {
  entry: DictionaryEntry;
  variant?: 'hero' | 'card';
}

export function WordOfTheDay({ entry, variant = 'card' }: Props) {
  const today = new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' });
  const pos = POS_LABELS[entry.partOfSpeech] ?? entry.partOfSpeech;
  const genderShort = entry.gender === 'masculine' ? 'fir.' : entry.gender === 'feminine' ? 'bain.' : null;

  if (variant === 'hero') {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-shamrock-800/60 bg-gradient-to-br from-shamrock-900/40 via-dark-900 to-dark-900 px-6 py-10 sm:px-12 sm:py-14">
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-shamrock-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-shamrock-700/10 blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-shamrock-400 text-xs font-medium uppercase tracking-[0.18em]">
                Focal an Lae
              </span>
              <span className="text-gray-700 text-xs">·</span>
              <span className="text-gray-500 text-xs uppercase tracking-widest">Word of the Day</span>
            </div>

            <h1
              lang="ga"
              style={{ hyphens: 'none', wordBreak: 'normal', overflowWrap: 'normal' }}
              className="font-display font-semibold text-shamrock-200 leading-[0.95] tracking-tight
                         text-[clamp(2.75rem,10vw,7rem)] mb-4"
            >
              {entry.irish}
            </h1>
            <p className="text-2xl sm:text-3xl text-gray-100 font-light leading-snug max-w-2xl">
              {entry.english}
            </p>

            <div className="flex items-center gap-3 mt-6 text-sm">
              <span className="text-gray-400 italic" lang="ga">{pos}</span>
              {genderShort && (
                <>
                  <span className="text-gray-700">·</span>
                  <span className="text-gold-400" lang="ga">{genderShort}</span>
                </>
              )}
              <span className="text-gray-700">·</span>
              <span className="text-gray-500 capitalize">{entry.category}</span>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-2 text-right pb-2">
            <p className="text-xs uppercase tracking-widest text-gray-600">Today</p>
            <p className="text-sm text-gray-400">{today}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-shamrock-800/60 bg-gradient-to-br from-shamrock-900/40 to-dark-900 p-6">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-shamrock-600/10 blur-2xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-4">
        <span className="text-shamrock-400 text-sm font-medium uppercase tracking-widest">
          Focal an Lae
        </span>
        <span className="text-gray-600 text-sm">·</span>
        <span className="text-gray-500 text-sm">Word of the Day</span>
      </div>

      <p lang="ga" className="font-display font-semibold text-shamrock-300 tracking-tight text-4xl sm:text-5xl mb-1 leading-tight">
        {entry.irish}
      </p>
      <p className="text-xl text-gray-200 mb-3">{entry.english}</p>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 italic">{pos}</span>
        {genderShort && <span className="text-xs text-gold-500">{genderShort}</span>}
        <span className="ml-auto text-xs text-gray-600 capitalize">{entry.category}</span>
      </div>

      <p className="mt-4 text-xs text-gray-600 border-t border-white/5 pt-3">{today}</p>
    </div>
  );
}
