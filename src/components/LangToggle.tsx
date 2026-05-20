import { useLang } from '../lang';

export function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div
      role="group"
      aria-label="Display language"
      className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-0.5 text-xs font-medium select-none"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={
          'px-3 py-1.5 rounded-full transition-colors ' +
          (lang === 'en'
            ? 'bg-shamrock-600 text-white shadow-sm'
            : 'text-gray-400 hover:text-gray-200')
        }
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('ga')}
        aria-pressed={lang === 'ga'}
        className={
          'px-3 py-1.5 rounded-full transition-colors ' +
          (lang === 'ga'
            ? 'bg-shamrock-600 text-white shadow-sm'
            : 'text-gray-400 hover:text-gray-200')
        }
      >
        GA
      </button>
    </div>
  );
}
