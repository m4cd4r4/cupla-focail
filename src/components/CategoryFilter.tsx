import type { DictionaryCategory } from '../data/irish-dictionary';

const CATEGORIES: Array<{ key: DictionaryCategory; emoji: string; label: string }> = [
  { key: 'family',       emoji: '👨‍👩‍👧‍👦', label: 'Family' },
  { key: 'greetings',    emoji: '👋',     label: 'Greetings' },
  { key: 'emotions',     emoji: '💚',     label: 'Emotions' },
  { key: 'conversation', emoji: '💬',     label: 'Conversation' },
  { key: 'food',         emoji: '🍽️',    label: 'Food' },
  { key: 'home',         emoji: '🏠',     label: 'Home' },
  { key: 'time',         emoji: '🕐',     label: 'Time' },
  { key: 'nature',       emoji: '🌿',     label: 'Nature' },
  { key: 'body',         emoji: '🫀',     label: 'Body' },
  { key: 'school',       emoji: '📚',     label: 'School' },
  { key: 'travel',       emoji: '✈️',     label: 'Travel' },
  { key: 'numbers',      emoji: '🔢',     label: 'Numbers' },
  { key: 'colors',       emoji: '🎨',     label: 'Colors' },
  { key: 'common',       emoji: '📝',     label: 'Common' },
  { key: 'health',       emoji: '🏥',     label: 'Health' },
  { key: 'weather',      emoji: '🌦️',    label: 'Weather' },
  { key: 'sports',       emoji: '⚽',     label: 'Sports' },
  { key: 'work',         emoji: '💼',     label: 'Work' },
  { key: 'places',       emoji: '📍',     label: 'Places' },
  { key: 'clothing',     emoji: '👗',     label: 'Clothing' },
  { key: 'music',        emoji: '🎵',     label: 'Music' },
  { key: 'culture',      emoji: '🍀',     label: 'Culture' },
  { key: 'animals',      emoji: '🐾',     label: 'Animals' },
];

interface Props {
  selected: DictionaryCategory | null;
  onChange: (c: DictionaryCategory | null) => void;
  counts: Record<string, number>;
}

export function CategoryFilter({ selected, onChange, counts }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin" role="tablist" aria-label="Filter by category">
      <button
        role="tab"
        aria-selected={selected === null}
        onClick={() => onChange(null)}
        className={`chip ${selected === null ? 'chip-active' : 'chip-inactive'}`}
      >
        All words
      </button>
      {CATEGORIES.map(({ key, emoji, label }) => {
        const count = counts[key] ?? 0;
        if (count === 0) return null;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={selected === key}
            onClick={() => onChange(selected === key ? null : key)}
            className={`chip ${selected === key ? 'chip-active' : 'chip-inactive'}`}
          >
            {emoji} {label}
          </button>
        );
      })}
    </div>
  );
}
