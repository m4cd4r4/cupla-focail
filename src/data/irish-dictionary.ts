// Irish-English dictionary — types + data re-export
//
// Sources:
//   curated    — hand-curated entries
//   lsg        — LSG Irish WordNet (GFDL 1.2+)  https://github.com/kscanne/wordnet-gaeilge
//   wiktionary — Wiktextract / kaikki.org (CC BY-SA 4.0)  https://kaikki.org/dictionary/Irish/
//   gramadan   — Gramadan Morphology DB (ODbL)  https://www.teanglann.ie/en/gram/_download
//   paracrawl  — ParaCrawl v9 EN-GA (CC0)  https://paracrawl.eu/

import rawEntries from './irish-dictionary-data.json';

export type PartOfSpeech =
  | 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase'
  | 'pronoun' | 'preposition' | 'conjunction' | 'interjection' | 'numeral';

export type DataSource = 'curated' | 'lsg' | 'wiktionary' | 'gramadan' | 'paracrawl';

export type DictionaryCategory =
  // Original 23
  | 'family' | 'greetings' | 'emotions' | 'time' | 'food'
  | 'body' | 'nature' | 'home' | 'school' | 'travel'
  | 'numbers' | 'colors' | 'common' | 'conversation'
  | 'health' | 'weather' | 'sports' | 'work' | 'places'
  | 'clothing' | 'music' | 'culture' | 'animals'
  // New 12 — from WordNet/Wiktionary expansion
  | 'religion' | 'law' | 'science' | 'technology' | 'agriculture'
  | 'mythology' | 'arts' | 'military' | 'politics' | 'business'
  | 'geography' | 'plants';

export interface DictionaryEntry {
  id: string;
  irish: string;
  english: string;
  englishAlt?: string[];
  partOfSpeech: PartOfSpeech;
  category: DictionaryCategory;
  gender?: 'masculine' | 'feminine';
  searchTerms: string[];
  // Extended fields — populated by data pipeline
  source?: DataSource;
  pronunciation?: string;    // IPA string e.g. "/ˈmˠaːhɪɾʲ/"
  inflections?: string[];    // declined/conjugated forms e.g. ["máthar", "máithreacha"]
  synonymIds?: string[];     // IDs of semantically related entries (from WordNet synsets)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DICTIONARY_ENTRIES: DictionaryEntry[] = rawEntries as any;
