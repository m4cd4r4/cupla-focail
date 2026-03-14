"""
Import LSG Irish WordNet into DictionaryEntry format.

Source: https://github.com/kscanne/wordnet-gaeilge
License: GFDL 1.2+ (entries tagged source='lsg')
Format: XML (Lexical Markup Framework)

Usage:
    pip install lxml requests tqdm
    python import_lsg.py

Output: output/lsg_entries.json
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

try:
    from lxml import etree
    import requests
    from tqdm import tqdm
except ImportError:
    print("Missing dependencies. Run: pip install lxml requests tqdm")
    sys.exit(1)

from utils import (
    make_id, build_search_terms, is_valid_irish_word, map_pos,
    WORDNET_DOMAIN_TO_CATEGORY, VALID_CATEGORIES,
)

# LSG GitHub release URL - the main LMF XML file
LSG_REPO = "https://github.com/kscanne/wordnet-gaeilge"
LSG_RAW_URL = "https://raw.githubusercontent.com/kscanne/wordnet-gaeilge/master/lsg.xml"

OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_FILE = OUTPUT_DIR / "lsg_entries.json"
RAW_FILE = OUTPUT_DIR / "lsg_raw.xml"


def download_lsg():
    if RAW_FILE.exists():
        print(f"Using cached {RAW_FILE}")
        return

    print(f"Downloading LSG WordNet XML from {LSG_RAW_URL} ...")
    r = requests.get(LSG_RAW_URL, timeout=60, stream=True)
    r.raise_for_status()

    total = int(r.headers.get('content-length', 0))
    OUTPUT_DIR.mkdir(exist_ok=True)

    with open(RAW_FILE, 'wb') as f, tqdm(total=total, unit='B', unit_scale=True, desc='lsg.xml') as bar:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
            bar.update(len(chunk))
    print(f"Saved to {RAW_FILE}")


def infer_category_from_synset(synset_id: str, topics: list[str]) -> str:
    """Map WordNet synset ID prefix or topic tag to our category."""
    for topic in topics:
        for key, cat in WORDNET_DOMAIN_TO_CATEGORY.items():
            if topic.lower().startswith(key.lower()):
                return cat

    # Infer from synset ID prefix (e.g., 'n' for noun, domain from offset range)
    prefix = synset_id.split('-')[0] if '-' in synset_id else ''
    if prefix.startswith('n'):
        return 'common'
    elif prefix.startswith('v'):
        return 'common'
    elif prefix.startswith('a') or prefix.startswith('s'):
        return 'common'
    return 'common'


def extract_synset_definitions(root) -> dict[str, dict]:
    """Build a map of synset ID → {definition, topics, pos} from SynsetRelations."""
    synset_map = {}
    ns = {'': 'http://globalwordnet.github.io/schemas/wn#'}

    for synset in root.iter('{http://globalwordnet.github.io/schemas/wn#}Synset'):
        sid = synset.get('id', '')
        pos = synset.get('partOfSpeech', 'n')
        definition = ''
        topics = []

        for defn in synset.iter('{http://globalwordnet.github.io/schemas/wn#}Definition'):
            definition = defn.text or ''
            break

        for topic in synset.iter('{http://globalwordnet.github.io/schemas/wn#}Topic'):
            topics.append(topic.get('id', ''))

        # Also check ILI (Princeton WordNet synset links) for category hints
        ili = synset.get('ili', '')

        synset_map[sid] = {'definition': definition, 'topics': topics, 'pos': pos, 'ili': ili}

    return synset_map


def parse_lsg(xml_path: Path) -> list[dict]:
    """Parse LSG XML and return DictionaryEntry-compatible dicts."""
    print(f"Parsing {xml_path} ...")
    tree = etree.parse(str(xml_path))
    root = tree.getroot()

    # Namespace handling - LSG uses GlobalWordNet LMF schema
    ns = root.nsmap.get(None, '')
    tag = lambda name: f'{{{ns}}}{name}' if ns else name

    synset_map = extract_synset_definitions(root)
    entries = []
    seen_ids = set()

    lexicon_iter = root.iter(tag('LexicalEntry'))
    for lex_entry in tqdm(lexicon_iter, desc='LexicalEntries', unit='entry'):
        lemma_el = lex_entry.find(tag('Lemma'))
        if lemma_el is None:
            continue

        irish = lemma_el.get('writtenForm', '').strip()
        if not irish or not is_valid_irish_word(irish):
            continue

        raw_pos = lemma_el.get('partOfSpeech', 'n')
        pos = map_pos(raw_pos)

        # Collect all senses
        senses = lex_entry.findall(tag('Sense'))
        if not senses:
            continue

        inflection_forms = []
        for form_el in lex_entry.findall(tag('Form')):
            form_written = form_el.get('writtenForm', '').strip()
            if form_written and form_written != irish:
                inflection_forms.append(form_written)

        synset_ids = []
        for sense in senses:
            synset_ref = sense.get('synset', '')
            if synset_ref:
                synset_ids.append(synset_ref)

        # Get English glosses from synset definitions
        english_translations = []
        category = 'common'
        for sid in synset_ids[:3]:  # Use first 3 synsets max
            sdata = synset_map.get(sid, {})
            if sdata.get('definition'):
                english_translations.append(sdata['definition'])
            cat = infer_category_from_synset(sid, sdata.get('topics', []))
            if cat != 'common':
                category = cat

        if not english_translations:
            continue

        english = english_translations[0]
        english_alt = english_translations[1:] if len(english_translations) > 1 else []

        entry_id = make_id(irish)
        # Make IDs unique by appending suffix for duplicates
        unique_id = entry_id
        suffix = 2
        while unique_id in seen_ids:
            unique_id = f"{entry_id}-{suffix}"
            suffix += 1
        seen_ids.add(unique_id)

        entry = {
            'id': unique_id,
            'irish': irish,
            'english': english,
            'partOfSpeech': pos,
            'category': category,
            'searchTerms': build_search_terms(irish, english, english_alt, inflection_forms),
            'source': 'lsg',
        }

        if english_alt:
            entry['englishAlt'] = english_alt[:3]  # cap at 3
        if inflection_forms:
            entry['inflections'] = inflection_forms[:8]  # cap at 8
        if synset_ids:
            entry['synonymIds'] = synset_ids[:5]  # cap at 5

        entries.append(entry)

    return entries


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    download_lsg()

    entries = parse_lsg(RAW_FILE)
    print(f"\nExtracted {len(entries):,} entries from LSG WordNet")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

    print(f"Saved to {OUTPUT_FILE}")

    # Stats
    from collections import Counter
    cats = Counter(e['category'] for e in entries)
    print("\nTop categories:")
    for cat, count in cats.most_common(10):
        print(f"  {cat}: {count:,}")


if __name__ == '__main__':
    main()
