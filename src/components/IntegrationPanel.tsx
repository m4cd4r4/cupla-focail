import { useState } from 'react';
import { useLang, type Lang } from '../lang';

type Tab = 'widget' | 'iframe' | 'api' | 'npm';

interface TabContent {
  lang: string;
  label: { en: string; ga: string };
  code: (l: Lang) => string;
}

const widget = (l: Lang) =>
  l === 'ga'
    ? `<!-- Cuir isteach in aon leathanach gréasáin -->
<script src="https://cuplafocail.ie/widget.js" defer></script>

<!-- Beidh cnaipe seamróige le feiceáil sa chúinne ar dheis ar bun.
     Cliceáil air chun an foclóir Gaeilge a oscailt. -->`
    : `<!-- Drop into any web page -->
<script src="https://cuplafocail.ie/widget.js" defer></script>

<!-- A shamrock button appears in the bottom-right corner.
     Click it to open the Irish dictionary panel. -->`;

const iframe = (l: Lang) =>
  l === 'ga'
    ? `<!-- Leabaigh comhéadan iomlán an fhoclóra in aon áit -->
<iframe
  src="https://cuplafocail.ie/embed"
  width="100%"
  height="600"
  style="border:none;border-radius:12px;"
  title="Foclóir Gaeilge-Béarla"
  loading="lazy"
></iframe>

<!-- Seol catagóir tríd an URL -->
<iframe src="https://cuplafocail.ie/embed?category=greetings" ... />`
    : `<!-- Embed the full dictionary UI anywhere -->
<iframe
  src="https://cuplafocail.ie/embed"
  width="100%"
  height="600"
  style="border:none;border-radius:12px;"
  title="Irish-English Dictionary"
  loading="lazy"
></iframe>

<!-- Pass a category via query param -->
<iframe src="https://cuplafocail.ie/embed?category=greetings" ... />`;

const api = (l: Lang) =>
  l === 'ga'
    ? `# Cuardach
GET https://cuplafocail.ie/api/search?q=mother

# Scag de réir catagóire
GET https://cuplafocail.ie/api/search?q=hello&category=greetings&limit=10

# Focal an Lae
GET https://cuplafocail.ie/api/word-of-the-day

# Freagra
{
  "entries": [
    {
      "id": "mathair",
      "irish": "máthair",
      "english": "mother",
      "partOfSpeech": "noun",
      "category": "family",
      "gender": "feminine",
      "searchTerms": ["mathair", "mother", "mom", "mam"]
    }
  ],
  "total": 3,
  "query": "mother"
}`
    : `# Search
GET https://cuplafocail.ie/api/search?q=mother

# Filter by category
GET https://cuplafocail.ie/api/search?q=hello&category=greetings&limit=10

# Word of the day
GET https://cuplafocail.ie/api/word-of-the-day

# Response
{
  "entries": [
    {
      "id": "mathair",
      "irish": "máthair",
      "english": "mother",
      "partOfSpeech": "noun",
      "category": "family",
      "gender": "feminine",
      "searchTerms": ["mathair", "mother", "mom", "mam"]
    }
  ],
  "total": 3,
  "query": "mother"
}`;

const npm = (l: Lang) =>
  l === 'ga'
    ? `npm install irish-dictionary

import { DICTIONARY_ENTRIES, search, wordOfTheDay } from 'irish-dictionary';

// Cuardach Béarla → Gaeilge
const results = search(DICTIONARY_ENTRIES, 'mother');

// Cuardach Gaeilge → Béarla (gan aird ar fhada)
const results2 = search(DICTIONARY_ENTRIES, 'mathair');

// Scag de réir catagóire
const family = search(DICTIONARY_ENTRIES, '', {
  category: 'family',
  limit: 50,
});

// Focal an Lae
const wotd = wordOfTheDay(DICTIONARY_ENTRIES);
console.log(\`\${wotd.irish} — \${wotd.english}\`);`
    : `npm install irish-dictionary

import { DICTIONARY_ENTRIES, search, wordOfTheDay } from 'irish-dictionary';

// Search English → Irish
const results = search(DICTIONARY_ENTRIES, 'mother');

// Search Irish → English (fada-insensitive)
const results2 = search(DICTIONARY_ENTRIES, 'mathair');

// Filter by category
const family = search(DICTIONARY_ENTRIES, '', {
  category: 'family',
  limit: 50,
});

// Word of the day
const wotd = wordOfTheDay(DICTIONARY_ENTRIES);
console.log(\`\${wotd.irish} — \${wotd.english}\`);`;

const CONTENT: Record<Tab, TabContent> = {
  widget: { lang: 'html',       label: { en: 'Widget (1 line)', ga: 'Giuirléid (líne amháin)' }, code: widget },
  iframe: { lang: 'html',       label: { en: 'iframe Embed',    ga: 'Leabú iframe' },             code: iframe },
  api:    { lang: 'bash',       label: { en: 'REST API',        ga: 'API REST' },                 code: api },
  npm:    { lang: 'typescript', label: { en: 'npm Package',     ga: 'Pacáiste npm' },             code: npm },
};

export function IntegrationPanel() {
  const { lang, t } = useLang();
  const [tab, setTab] = useState<Tab>('widget');
  const [copied, setCopied] = useState(false);

  const code = CONTENT[tab].code(lang);
  const langAttr = CONTENT[tab].lang;

  const copy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {(Object.entries(CONTENT) as [Tab, TabContent][]).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === key
                ? 'text-shamrock-300 border-b-2 border-shamrock-500 bg-shamrock-900/20'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {lang === 'ga' ? label.ga : label.en}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div className="relative">
        <button
          onClick={copy}
          className="absolute top-3 right-3 px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-gray-200 transition-colors"
        >
          {copied ? t('✓ Copied', '✓ Cóipeáilte') : t('Copy', 'Cóipeáil')}
        </button>
        <pre className="p-5 text-sm text-gray-300 overflow-x-auto leading-relaxed" data-lang={langAttr}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
