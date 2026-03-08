import { useState } from 'react';

type Tab = 'widget' | 'api' | 'npm' | 'iframe';

const CODE: Record<Tab, { lang: string; label: string; code: string }> = {
  widget: {
    lang: 'html',
    label: 'Widget (1 line)',
    code: `<!-- Drop into any web page -->
<script src="https://focloir.vercel.app/widget.js" defer></script>

<!-- A shamrock button appears in the bottom-right corner.
     Click it to open the Irish dictionary panel. -->`,
  },
  iframe: {
    lang: 'html',
    label: 'iframe Embed',
    code: `<!-- Embed the full dictionary UI anywhere -->
<iframe
  src="https://focloir.vercel.app/embed"
  width="100%"
  height="600"
  style="border:none;border-radius:12px;"
  title="Irish-English Dictionary"
  loading="lazy"
></iframe>

<!-- Pass a category via query param -->
<iframe src="https://focloir.vercel.app/embed?category=greetings" ... />`,
  },
  api: {
    lang: 'bash',
    label: 'REST API',
    code: `# Search
GET https://focloir.vercel.app/api/search?q=mother

# Filter by category
GET https://focloir.vercel.app/api/search?q=hello&category=greetings&limit=10

# Word of the day
GET https://focloir.vercel.app/api/word-of-the-day

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
}`,
  },
  npm: {
    lang: 'typescript',
    label: 'npm Package',
    code: `npm install irish-dictionary

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
console.log(\`\${wotd.irish} — \${wotd.english}\`);`,
  },
};

export function IntegrationPanel() {
  const [tab, setTab] = useState<Tab>('widget');
  const [copied, setCopied] = useState(false);

  const { code, lang } = CODE[tab];

  const copy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {(Object.entries(CODE) as [Tab, typeof CODE[Tab]][]).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === key
                ? 'text-shamrock-300 border-b-2 border-shamrock-500 bg-shamrock-900/20'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div className="relative">
        <button
          onClick={copy}
          className="absolute top-3 right-3 px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-gray-200 transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <pre className="p-5 text-sm text-gray-300 overflow-x-auto leading-relaxed" data-lang={lang}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
