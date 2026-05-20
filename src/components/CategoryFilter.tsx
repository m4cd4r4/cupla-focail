import type { DictionaryCategory } from '../data/irish-dictionary';
import { useLang } from '../lang';

const CATEGORIES: Array<{ key: DictionaryCategory; emoji: string; en: string; ga: string }> = [
  // Original 23
  { key: 'family',       emoji: '👨‍👩‍👧‍👦', en: 'Family',       ga: 'Teaghlach' },
  { key: 'greetings',    emoji: '👋',     en: 'Greetings',    ga: 'Beannachtaí' },
  { key: 'emotions',     emoji: '💚',     en: 'Emotions',     ga: 'Mothúcháin' },
  { key: 'conversation', emoji: '💬',     en: 'Conversation', ga: 'Comhrá' },
  { key: 'food',         emoji: '🍽️',    en: 'Food',         ga: 'Bia' },
  { key: 'home',         emoji: '🏠',     en: 'Home',         ga: 'Baile' },
  { key: 'time',         emoji: '🕐',     en: 'Time',         ga: 'Am' },
  { key: 'nature',       emoji: '🌿',     en: 'Nature',       ga: 'Dúlra' },
  { key: 'body',         emoji: '🫀',     en: 'Body',         ga: 'Corp' },
  { key: 'school',       emoji: '📚',     en: 'School',       ga: 'Scoil' },
  { key: 'travel',       emoji: '✈️',     en: 'Travel',       ga: 'Taisteal' },
  { key: 'numbers',      emoji: '🔢',     en: 'Numbers',      ga: 'Uimhreacha' },
  { key: 'colors',       emoji: '🎨',     en: 'Colors',       ga: 'Dathanna' },
  { key: 'common',       emoji: '📝',     en: 'Common',       ga: 'Coitianta' },
  { key: 'health',       emoji: '🏥',     en: 'Health',       ga: 'Sláinte' },
  { key: 'weather',      emoji: '🌦️',    en: 'Weather',      ga: 'Aimsir' },
  { key: 'sports',       emoji: '⚽',     en: 'Sports',       ga: 'Spóirt' },
  { key: 'work',         emoji: '💼',     en: 'Work',         ga: 'Obair' },
  { key: 'places',       emoji: '📍',     en: 'Places',       ga: 'Áiteanna' },
  { key: 'clothing',     emoji: '👗',     en: 'Clothing',     ga: 'Éadaí' },
  { key: 'music',        emoji: '🎵',     en: 'Music',        ga: 'Ceol' },
  { key: 'culture',      emoji: '🍀',     en: 'Culture',      ga: 'Cultúr' },
  { key: 'animals',      emoji: '🐾',     en: 'Animals',      ga: 'Ainmhithe' },
  // New 12 — from WordNet/Wiktionary expansion
  { key: 'plants',       emoji: '🌱',     en: 'Plants',       ga: 'Plandaí' },
  { key: 'religion',     emoji: '⛪',     en: 'Religion',     ga: 'Creideamh' },
  { key: 'mythology',    emoji: '🐉',     en: 'Mythology',    ga: 'Miotaseolaíocht' },
  { key: 'science',      emoji: '🔬',     en: 'Science',      ga: 'Eolaíocht' },
  { key: 'technology',   emoji: '💻',     en: 'Technology',   ga: 'Teicneolaíocht' },
  { key: 'agriculture',  emoji: '🌾',     en: 'Agriculture',  ga: 'Talmhaíocht' },
  { key: 'arts',         emoji: '🎭',     en: 'Arts',         ga: 'Na hEalaíona' },
  { key: 'geography',    emoji: '🗺️',    en: 'Geography',    ga: 'Tíreolaíocht' },
  { key: 'law',          emoji: '⚖️',     en: 'Law',          ga: 'Dlí' },
  { key: 'politics',     emoji: '🏛️',    en: 'Politics',     ga: 'Polaitíocht' },
  { key: 'military',     emoji: '🛡️',    en: 'Military',     ga: 'Míleata' },
  { key: 'business',     emoji: '📊',     en: 'Business',     ga: 'Gnó' },
];

interface Props {
  selected: DictionaryCategory | null;
  onChange: (c: DictionaryCategory | null) => void;
  counts: Record<string, number>;
}

export function CategoryFilter({ selected, onChange, counts }: Props) {
  const { t, lang } = useLang();

  return (
    <div className="relative">
      <div
        className="flex flex-wrap gap-2 pb-1"
        role="tablist"
        aria-label={t('Filter by category', 'Scag de réir catagóire')}
      >
        <button
          role="tab"
          aria-selected={selected === null}
          onClick={() => onChange(null)}
          className={`chip ${selected === null ? 'chip-active' : 'chip-inactive'}`}
        >
          {t('All words', 'Gach focal')}
        </button>
        {CATEGORIES.map(({ key, emoji, en, ga }) => {
          const count = counts[key] ?? 0;
          if (count === 0) return null;
          const label = lang === 'ga' ? ga : en;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={selected === key}
              onClick={() => onChange(selected === key ? null : key)}
              className={`chip ${selected === key ? 'chip-active' : 'chip-inactive'}`}
              lang={lang === 'ga' ? 'ga' : 'en'}
            >
              {emoji} {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
