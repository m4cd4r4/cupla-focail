import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'ga';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string, ga: string) => string;
}

const Ctx = createContext<LangCtx | null>(null);

const STORAGE_KEY = 'cuplafocail.lang';

function readInitial(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'ga' || stored === 'en') return stored;
  return 'en';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitial);

  useEffect(() => {
    document.documentElement.lang = lang === 'ga' ? 'ga' : 'en';
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  };

  const t = (en: string, ga: string) => (lang === 'ga' ? ga : en);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useLang must be used inside <LangProvider>');
  return c;
}
