# Foclóir — Irish-English Dictionary

> **Live:** https://irish-dictionary-app.vercel.app · **API:** https://irish-dictionary-app.vercel.app/api/search

A free, open-source Irish-English dictionary with **27,755 entries** across 23 categories. Built to be integrated into Irish language apps, learning tools, and messaging platforms.

---

## Integration Options

### Option 1 — Widget (1 line of HTML)

Drop a floating Irish dictionary button onto any web page:

```html
<script src="https://irish-dictionary-app.vercel.app/widget.js" defer></script>
```

A 🍀 button appears in the bottom-right corner. Click to open a full dictionary panel.

**Options via `data-*` attributes:**

```html
<script
  src="https://irish-dictionary-app.vercel.app/widget.js"
  data-position="bottom-left"
  data-color="#16a34a"
  data-category="greetings"
  defer
></script>
```

| Attribute | Default | Options |
|-----------|---------|---------|
| `data-position` | `bottom-right` | `bottom-left` |
| `data-color` | `#16a34a` | Any CSS color |
| `data-category` | _(none)_ | Any category name |

---

### Option 2 — iframe Embed

Embed the full dictionary UI inside your app:

```html
<iframe
  src="https://irish-dictionary-app.vercel.app/embed"
  width="100%"
  height="600"
  style="border:none; border-radius:12px;"
  title="Irish-English Dictionary"
  loading="lazy"
></iframe>
```

Pre-select a category:

```html
<iframe src="https://irish-dictionary-app.vercel.app/embed?category=greetings" ...></iframe>
```

Available categories: `family`, `greetings`, `emotions`, `conversation`, `food`, `home`, `time`, `nature`, `body`, `school`, `travel`, `numbers`, `colors`, `common`, `health`, `weather`, `sports`, `work`, `places`, `clothing`, `music`, `culture`

---

### Option 3 — REST API

Language-agnostic. Works with any backend or mobile app.

```bash
# Search (English or Irish, fada-insensitive)
GET https://irish-dictionary-app.vercel.app/api/search?q=mother
GET https://irish-dictionary-app.vercel.app/api/search?q=máthair
GET https://irish-dictionary-app.vercel.app/api/search?q=mathair   # same result

# Filter by category + limit
GET https://irish-dictionary-app.vercel.app/api/search?q=hello&category=greetings&limit=10

# All categories with counts
GET https://irish-dictionary-app.vercel.app/api/categories

# Word of the day (deterministic per calendar day)
GET https://irish-dictionary-app.vercel.app/api/word-of-the-day

# Single entry by ID
GET https://irish-dictionary-app.vercel.app/api/entry/mathair
```

**Response schema:**

```json
{
  "entries": [
    {
      "id": "mathair",
      "irish": "máthair",
      "english": "mother",
      "englishAlt": ["mom", "mam"],
      "partOfSpeech": "noun",
      "category": "family",
      "gender": "feminine",
      "searchTerms": ["mathair", "mother", "mom", "mam"]
    }
  ],
  "total": 3,
  "query": "mother"
}
```

All API endpoints return `Access-Control-Allow-Origin: *` — safe to call from any origin.

---

### Option 4 — npm Package (TypeScript/JavaScript)

Zero dependencies, works in React, Vue, Svelte, Next.js, Node.js, Deno:

```bash
npm install irish-dictionary
```

```typescript
import { DICTIONARY_ENTRIES, search, wordOfTheDay } from 'irish-dictionary';

// Search English → Irish
const results = search(DICTIONARY_ENTRIES, 'mother');

// Search Irish → English (fada-insensitive)
const results2 = search(DICTIONARY_ENTRIES, 'mathair');

// Filter by category
const family = search(DICTIONARY_ENTRIES, '', { category: 'family', limit: 50 });

// Word of the day
const wotd = wordOfTheDay(DICTIONARY_ENTRIES);
console.log(`${wotd.irish} — ${wotd.english}`);
```

→ [npm package repo](https://github.com/m4cd4r4/irish-dictionary)

---

## Data

**27,755 entries** across 23 categories:

| Category | Irish | Entries |
|----------|-------|---------|
| common | coitianta | ~170 |
| food | bia | ~140 |
| conversation | comhrá | ~130 |
| work | obair | ~120 |
| emotions | mothúcháin | ~120 |
| family | teaghlach | ~120 |
| health | sláinte | ~110 |
| sports | spórt | ~105 |
| places | áiteanna | ~100 |
| home | baile | ~100 |
| nature | nádúr | ~100 |
| time | am | ~100 |
| greetings | beannachtaí | ~100 |
| body | corp | ~90 |
| school | scoil | ~90 |
| culture | cultúr | ~90 |
| travel | taisteal | ~85 |
| weather | aimsir | ~75 |
| music | ceol | ~75 |
| clothing | éadaí | ~70 |
| numbers | uimhreacha | ~50 |
| colors | dathanna | ~35 |

**Entry structure:**

```typescript
interface DictionaryEntry {
  id: string;               // ASCII slug: "mathair"
  irish: string;            // with fadas: "máthair"
  english: string;          // primary: "mother"
  englishAlt?: string[];    // alternatives: ["mom", "mam"]
  partOfSpeech: PartOfSpeech;
  category: DictionaryCategory;
  gender?: 'masculine' | 'feminine';
  searchTerms: string[];    // pre-computed, fada-stripped, lowercase
}
```

---

## Local Development

```bash
git clone https://github.com/m4cd4r4/irish-dictionary-app
cd irish-dictionary-app
npm install
npm run dev        # → http://localhost:5173
```

**Routes:**
- `/` — Full demo app
- `/embed` — Minimal iframe-embeddable view
- `/embed?category=greetings` — Pre-filtered embed
- `/api/search?q=mother` — REST API (via Vercel Functions in prod, Vite proxy in dev)
- `/widget.js` — Embeddable floating button script

---

## Deploy Your Own

One-click deploy to Vercel (free):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/m4cd4r4/irish-dictionary-app)

```bash
# Or via CLI
npm install -g vercel
vercel --prod
```

---

## Tech Stack

- **Vite** + React 18 + TypeScript
- **Tailwind CSS** — dark Celtic theme
- **React Router** — `/` and `/embed` routes
- **Vercel** — hosting + serverless API functions
- **Zero runtime dependencies** — dictionary data is bundled, code-split

---

## Contributing

Contributions welcome — especially:
- Additional entries (accuracy over quantity)
- Example sentences
- Grammar notes (verb conjugations, declensions)
- Corrections

Please open an issue before large PRs.

---

## Related

- [**irish-dictionary**](https://github.com/m4cd4r4/irish-dictionary) — npm package (data + search logic only)
- [**Chlann**](https://chlann.com) — Irish-language family messaging app (where this dictionary originated)

---

## License

MIT © [Macdara Mac Domhnaill](https://github.com/m4cd4r4)

*Go n-éirí leat le do chuid Gaeilge!* — Good luck with your Irish!
