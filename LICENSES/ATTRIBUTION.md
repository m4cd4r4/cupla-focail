# Data Attribution

Cupla Focail (cuplafocail.ie) incorporates data from multiple open sources.
Each source has its own license — see the files in this directory.

## Sources

| Source | Field `source` | License | Description |
|--------|---------------|---------|-------------|
| Hand-curated | `curated` | MIT | Original entries curated for this project |
| LSG Irish WordNet | `lsg` | GFDL 1.2+ | Lionra Seimeantach na Gaeilge — Irish WordNet by Kevin Scannell et al. |
| Wiktextract / kaikki.org | `wiktionary` | CC BY-SA 4.0 | Extracted from English Wiktionary via kaikki.org |
| Gramadan | `gramadan` | ODbL 1.0 | Irish Morphology Database by Michal Mechura, hosted by Foras na Gaeilge |
| ParaCrawl v9 | `paracrawl` | CC0 | Bilingual EN-GA web crawl from the ParaCrawl project |

## LSG Irish WordNet (GFDL 1.2+)

**Lionra Seimeantach na Gaeilge** (The Semantic Network of Irish)
- Author: Kevin Scannell and contributors
- Repository: https://github.com/kscanne/wordnet-gaeilge
- License: GNU Free Documentation License 1.2+
- Full license text: [GFDL-1.2.txt](GFDL-1.2.txt)

Entries sourced from LSG are tagged `source: "lsg"` in the dictionary data.

## Wiktextract / English Wiktionary (CC BY-SA 4.0)

**kaikki.org Wiktionary extracts**
- Extracted by Tatu Ylonen using [wiktextract](https://github.com/tatuylonen/wiktextract)
- Data URL: https://kaikki.org/dictionary/Irish/
- Original source: English Wiktionary (https://en.wiktionary.org/)
- License: Creative Commons Attribution-ShareAlike 4.0 International
- Full license text: [CC-BY-SA-4.0.txt](CC-BY-SA-4.0.txt)

Entries sourced from Wiktionary are tagged `source: "wiktionary"` in the dictionary data.
Per CC BY-SA 4.0, derivatives of this data must also be shared under CC BY-SA 4.0.

## Gramadan (ODbL 1.0)

**Irish Morphology Database**
- Author: Michal Mechura
- Hosted by: Foras na Gaeilge at https://www.teanglann.ie/en/gram/_download
- Repository: https://github.com/michmech/Gramadan
- License: Open Database License 1.0
- Full license text: [ODbL-1.0.txt](ODbL-1.0.txt)

Morphological inflection data is used to enrich existing entries.
The ODbL requires that the database itself (inflection data) remains under ODbL if redistributed.

## ParaCrawl v9 (CC0)

**Paracrawl EN-GA Parallel Corpus**
- Source: https://paracrawl.eu/
- Version: v9 (English-Irish sentence pairs)
- License: Creative Commons Zero (CC0 — Public Domain Dedication)
- No restrictions on use or redistribution.

Entries mined from ParaCrawl are tagged `source: "paracrawl"`.
