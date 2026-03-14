# Cupla Focail — Data Pipeline

Scripts to expand the dictionary from ~28k to 60k-100k+ entries using open data sources.

## Setup

```bash
cd scripts
pip install -r requirements.txt
# Optional, for better ParaCrawl alignment:
pip install awesome-align
# Download NLTK stopwords (for ParaCrawl mining):
python -c "import nltk; nltk.download('stopwords')"
```

## Running the full pipeline

```bash
# Step 1: Import LSG Irish WordNet (~30k new entries)
python import_lsg.py

# Step 2: Import Wiktextract / kaikki.org (~5-10k new entries + IPA)
python import_wiktionary.py

# Step 3: Import Gramadan morphology (inflection enrichment)
python import_gramadan.py

# Step 4: Mine ParaCrawl for term pairs (~10-25k new entries)
python mine_paracrawl.py

# Step 5: Merge all sources into final JSON
python merge.py

# Step 6: Build the app
cd .. && npm run build
```

Run `python merge.py --dry-run` to preview stats without writing output.

## Data Sources

| Script | Source | License | Expected Yield |
|--------|--------|---------|---------------|
| `import_lsg.py` | [LSG Irish WordNet](https://github.com/kscanne/wordnet-gaeilge) | GFDL 1.2+ | ~30k entries |
| `import_wiktionary.py` | [kaikki.org](https://kaikki.org/dictionary/Irish/) | CC BY-SA 4.0 | ~5-10k entries + IPA |
| `import_gramadan.py` | [Gramadan](https://www.teanglann.ie/en/gram/_download) | ODbL 1.0 | Inflection enrichment |
| `mine_paracrawl.py` | [ParaCrawl v9](https://paracrawl.eu/) | CC0 | ~10-25k entries |

## Output Files

All intermediate files go in `output/`:

| File | Contents |
|------|----------|
| `lsg_raw.xml` | Raw LSG WordNet XML |
| `lsg_entries.json` | Parsed LSG entries |
| `kaikki_irish.jsonl` | Raw kaikki.org dump |
| `wiktionary_entries.json` | Parsed Wiktionary entries |
| `gramadan.zip` | Raw Gramadan ZIP |
| `gramadan_inflections.json` | Inflection enrichment map |
| `paracrawl_en.txt` | ParaCrawl English sentences |
| `paracrawl_ga.txt` | ParaCrawl Irish sentences |
| `paracrawl_entries.json` | Mined term pairs |

Final output: `../src/data/irish-dictionary-data.json`

## Licenses

See `../LICENSES/` for full license texts.

- Entries with `source: "lsg"` — GFDL 1.2+
- Entries with `source: "wiktionary"` — CC BY-SA 4.0
- Entries with `source: "gramadan"` — ODbL 1.0
- Entries with `source: "paracrawl"` — CC0
- Entries with `source: "curated"` — MIT
