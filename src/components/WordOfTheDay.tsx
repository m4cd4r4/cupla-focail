import type { DictionaryEntry } from '../data/irish-dictionary';

const POS_LABELS: Record<string, string> = {
  noun: 'ainmfhocal', verb: 'briathar', adjective: 'aidiacht',
  adverb: 'dobhriathar', pronoun: 'forainm', preposition: 'réamhfhocal',
  conjunction: 'cónasc', interjection: 'intriacht', phrase: 'frása', number: 'uimhir',
};

interface Props { entry: DictionaryEntry }

export function WordOfTheDay({ entry }: Props) {
  const today = new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-shamrock-800/60 bg-gradient-to-br from-shamrock-900/40 to-dark-900 p-6">
      {/* Decorative Celtic knot blob */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-shamrock-600/10 blur-2xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-4">
        <span className="text-shamrock-400 text-sm font-medium uppercase tracking-widest">
          Focal an Lae
        </span>
        <span className="text-gray-600 text-sm">·</span>
        <span className="text-gray-500 text-sm">Word of the Day</span>
      </div>

      <p className="text-4xl font-display font-bold text-shamrock-300 tracking-wide mb-1">
        {entry.irish}
      </p>
      <p className="text-xl text-gray-200 mb-3">{entry.english}</p>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 italic">{POS_LABELS[entry.partOfSpeech] ?? entry.partOfSpeech}</span>
        {entry.gender && (
          <span className="text-xs text-gold-500">
            {entry.gender === 'masculine' ? 'fir.' : 'bain.'}
          </span>
        )}
        <span className="ml-auto text-xs text-gray-600 capitalize">{entry.category}</span>
      </div>

      <p className="mt-4 text-xs text-gray-600 border-t border-white/5 pt-3">{today}</p>
    </div>
  );
}
