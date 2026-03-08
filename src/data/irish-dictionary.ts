// Irish-English dictionary — types + data re-export
// Sources: hand-curated (2,003) + LSG Irish WordNet (GFDL 1.2+) + Irish Sentence Bank (ODbL-1.0)
// Total: 27,755 entries

import rawEntries from './irish-dictionary-data.json';

export type PartOfSpeech =
  | 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase'
  | 'pronoun' | 'preposition' | 'conjunction' | 'interjection' | 'numeral';

export type DictionaryCategory =
  | 'family' | 'greetings' | 'emotions' | 'time' | 'food'
  | 'body' | 'nature' | 'home' | 'school' | 'travel'
  | 'numbers' | 'colors' | 'common' | 'conversation'
  | 'health' | 'weather' | 'sports' | 'work' | 'places'
  | 'clothing' | 'music' | 'culture' | 'animals';

export interface DictionaryEntry {
  id: string;
  irish: string;
  english: string;
  englishAlt?: string[];
  partOfSpeech: PartOfSpeech;
  category: DictionaryCategory;
  gender?: 'masculine' | 'feminine';
  searchTerms: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DICTIONARY_ENTRIES: DictionaryEntry[] = rawEntries as any;
