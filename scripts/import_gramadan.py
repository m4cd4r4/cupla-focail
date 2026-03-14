"""
Import Gramadan morphology database as inflection enrichment.

Source: https://www.teanglann.ie/en/gram/_download
License: ODbL 1.0 (enriched entries tagged source='gramadan')
Format: ZIP of XML files (one per word class)

Usage:
    pip install lxml requests tqdm
    python import_gramadan.py

Output: output/gramadan_inflections.json
  A map of { normalizedIrishLemma: { inflections: string[], gender?: string } }
  Applied during merge to enrich existing entries.
"""

import io
import json
import sys
import zipfile
from collections import defaultdict
from pathlib import Path

try:
    from lxml import etree
    import requests
    from tqdm import tqdm
except ImportError:
    print("Missing dependencies. Run: pip install lxml requests tqdm")
    sys.exit(1)

from utils import normalize_irish, is_valid_irish_word

GRAMADAN_URL = "https://www.teanglann.ie/aidm/gram/Gramadan.zip"

OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_FILE = OUTPUT_DIR / "gramadan_inflections.json"
RAW_FILE = OUTPUT_DIR / "gramadan.zip"


def download_gramadan():
    if RAW_FILE.exists():
        print(f"Using cached {RAW_FILE}")
        return

    print(f"Downloading Gramadan from {GRAMADAN_URL} ...")
    r = requests.get(GRAMADAN_URL, timeout=60, stream=True)
    r.raise_for_status()

    total = int(r.headers.get('content-length', 0))
    OUTPUT_DIR.mkdir(exist_ok=True)

    with open(RAW_FILE, 'wb') as f, tqdm(total=total, unit='B', unit_scale=True, desc='gramadan.zip') as bar:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
            bar.update(len(chunk))
    print(f"Saved to {RAW_FILE}")


def extract_noun_forms(xml_root) -> dict[str, list[str]]:
    """Extract all inflected forms from a Gramadan noun XML."""
    lemma = xml_root.get('default', '').strip()
    if not lemma:
        return {}

    forms = set()
    for form_el in xml_root.iter('form'):
        form = form_el.get('default', '').strip()
        if form and form != lemma and is_valid_irish_word(form):
            forms.add(form)

    return {normalize_irish(lemma): {'inflections': sorted(forms), 'lemma': lemma}}


def extract_verb_forms(xml_root) -> dict[str, list[str]]:
    """Extract all conjugated forms from a Gramadan verb XML."""
    lemma = xml_root.get('default', '').strip()
    if not lemma:
        return {}

    forms = set()
    # Gramadan verb XML uses tenses as child elements
    for tense_el in xml_root:
        for person_el in tense_el:
            form = person_el.get('default', '').strip()
            if form and form != lemma and is_valid_irish_word(form):
                forms.add(form)

    return {normalize_irish(lemma): {'inflections': sorted(forms), 'lemma': lemma}}


def extract_adj_forms(xml_root) -> dict[str, list[str]]:
    """Extract comparative/superlative forms from adjective XML."""
    lemma = xml_root.get('default', '').strip()
    if not lemma:
        return {}

    forms = set()
    for form_el in xml_root.iter('form'):
        form = form_el.get('default', '').strip()
        if form and form != lemma and is_valid_irish_word(form):
            forms.add(form)

    return {normalize_irish(lemma): {'inflections': sorted(forms), 'lemma': lemma}}


def parse_gramadan(zip_path: Path) -> dict:
    """Parse all Gramadan XML files and return inflection map."""
    print(f"Parsing Gramadan ZIP ...")
    inflection_map = {}
    skipped = 0

    with zipfile.ZipFile(zip_path) as zf:
        xml_files = [n for n in zf.namelist() if n.endswith('.xml')]
        print(f"  Found {len(xml_files):,} XML files")

        for xml_name in tqdm(xml_files, desc='Gramadan XML files'):
            try:
                with zf.open(xml_name) as f:
                    tree = etree.parse(f)
                    root = tree.getroot()

                tag = root.tag.lower()
                if 'noun' in tag:
                    result = extract_noun_forms(root)
                elif 'verb' in tag:
                    result = extract_verb_forms(root)
                elif 'adj' in tag:
                    result = extract_adj_forms(root)
                else:
                    result = {}

                inflection_map.update(result)
            except Exception:
                skipped += 1
                continue

    print(f"Extracted inflection data for {len(inflection_map):,} lemmas (skipped {skipped})")
    return inflection_map


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    download_gramadan()

    inflection_map = parse_gramadan(RAW_FILE)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(inflection_map, f, ensure_ascii=False, indent=2)

    print(f"Saved inflection map to {OUTPUT_FILE}")

    # Stats
    total_forms = sum(len(v['inflections']) for v in inflection_map.values())
    print(f"Total inflected forms: {total_forms:,}")
    print(f"Average forms per lemma: {total_forms / max(len(inflection_map), 1):.1f}")


if __name__ == '__main__':
    main()
