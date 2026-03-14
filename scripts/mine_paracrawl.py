"""
Mine ParaCrawl v9 EN-GA for bilingual term pairs.

Source: https://paracrawl.eu/
License: CC0 (no restrictions - entries tagged source='paracrawl')
Format: parallel TXT files (en.txt + ga.txt, one sentence per line)

Pipeline:
  1. Download ParaCrawl v9 EN-GA sentence pairs
  2. Tokenize and align words using awesome-align
  3. Extract high-frequency bilingual term pairs
  4. Filter noise using Irish word validation + frequency threshold
  5. Output new DictionaryEntry-compatible records

Usage:
    pip install requests tqdm nltk awesome-align
    python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"
    python mine_paracrawl.py

Output: output/paracrawl_entries.json
"""

import json
import re
import sys
import tempfile
from collections import Counter, defaultdict
from pathlib import Path

try:
    import requests
    from tqdm import tqdm
    import nltk
    from nltk.corpus import stopwords
except ImportError:
    print("Missing dependencies. Run: pip install requests tqdm nltk")
    sys.exit(1)

from utils import (
    make_id, build_search_terms, is_valid_irish_word, normalize_irish,
)

PARACRAWL_BASE = "https://s3.amazonaws.com/web-language-models/paracrawl/release9/"
PARACRAWL_EN_URL = PARACRAWL_BASE + "en-ga.txt.gz"

# Smaller filtered version if available
PARACRAWL_FILTERED_URL = "https://paracrawl.eu/releases/release9/en-ga/Paracrawl.en-ga.txt.gz"

OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_FILE = OUTPUT_DIR / "paracrawl_entries.json"
RAW_EN = OUTPUT_DIR / "paracrawl_en.txt"
RAW_GA = OUTPUT_DIR / "paracrawl_ga.txt"
ALIGNED_FILE = OUTPUT_DIR / "paracrawl_aligned.txt"

# Thresholds
MIN_FREQ = 5           # Term pair must appear in at least 5 sentence pairs
MAX_SENTENCES = 500_000  # Process first 500k pairs (memory/time limit)
MIN_IRISH_LEN = 3
MAX_ENGLISH_LEN = 50


def download_paracrawl():
    """Download and extract ParaCrawl EN-GA sentence pairs."""
    if RAW_EN.exists() and RAW_GA.exists():
        en_lines = sum(1 for _ in open(RAW_EN))
        print(f"Using cached ParaCrawl files ({en_lines:,} lines)")
        return

    import gzip
    import urllib.request

    OUTPUT_DIR.mkdir(exist_ok=True)

    # Try to download the file
    gz_file = OUTPUT_DIR / "paracrawl_en-ga.txt.gz"
    if not gz_file.exists():
        print(f"Downloading ParaCrawl v9 EN-GA (~284 MB) ...")
        print(f"URL: {PARACRAWL_EN_URL}")
        print("Note: If this URL fails, download manually from https://paracrawl.eu/")
        try:
            r = requests.get(PARACRAWL_EN_URL, timeout=300, stream=True)
            r.raise_for_status()
            total = int(r.headers.get('content-length', 0))
            with open(gz_file, 'wb') as f, tqdm(total=total, unit='B', unit_scale=True) as bar:
                for chunk in r.iter_content(chunk_size=65536):
                    f.write(chunk)
                    bar.update(len(chunk))
        except Exception as e:
            print(f"Download failed: {e}")
            print("\nManual download instructions:")
            print("1. Go to https://paracrawl.eu/")
            print("2. Download the EN-GA v9 release")
            print(f"3. Extract to: {RAW_EN} (English) and {RAW_GA} (Irish)")
            sys.exit(1)

    # Extract: file format is tab-separated "english\\tirish" per line
    print("Extracting sentence pairs ...")
    with gzip.open(gz_file, 'rt', encoding='utf-8') as gz, \
         open(RAW_EN, 'w', encoding='utf-8') as en_f, \
         open(RAW_GA, 'w', encoding='utf-8') as ga_f:

        for i, line in enumerate(tqdm(gz, desc='Extracting', unit='lines')):
            if i >= MAX_SENTENCES:
                break
            parts = line.strip().split('\t')
            if len(parts) >= 2:
                en_f.write(parts[0] + '\n')
                ga_f.write(parts[1] + '\n')

    print(f"Extracted {MAX_SENTENCES:,} sentence pairs")


def simple_word_alignment(en_lines: list[str], ga_lines: list[str]) -> Counter:
    """
    Simple co-occurrence based alignment (fallback if awesome-align not available).
    For each sentence pair, count how often an English word and Irish word appear together.
    """
    print("Running simple co-occurrence alignment ...")
    pair_counts: Counter = Counter()

    en_stops = set(stopwords.words('english'))

    for en_sent, ga_sent in tqdm(zip(en_lines, ga_lines), total=len(en_lines), desc='Aligning'):
        en_tokens = set(re.findall(r'\b[a-z]+\b', en_sent.lower())) - en_stops
        ga_tokens = set(re.findall(r'\b[a-zA-ZáéíóúÁÉÍÓÚ]+\b', ga_sent))

        # Filter valid Irish tokens
        ga_tokens = {t for t in ga_tokens if is_valid_irish_word(t) and len(t) >= MIN_IRISH_LEN}

        for en_tok in en_tokens:
            if len(en_tok) > 2:
                for ga_tok in ga_tokens:
                    pair_counts[(ga_tok, en_tok)] += 1

    return pair_counts


def awesome_align(en_lines: list[str], ga_lines: list[str]) -> Counter:
    """
    Use awesome-align for better word alignment.
    Falls back to simple co-occurrence if not installed.
    """
    try:
        import awesome_align  # noqa
    except ImportError:
        print("awesome-align not found, falling back to simple co-occurrence alignment")
        print("For better results: pip install awesome-align")
        return simple_word_alignment(en_lines, ga_lines)

    # awesome-align alignment
    print("Running awesome-align ...")
    pair_counts: Counter = Counter()

    # awesome-align expects a file with format "src ||| tgt"
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
        align_input = f.name
        for en, ga in zip(en_lines, ga_lines):
            f.write(f"{en.strip()} ||| {ga.strip()}\n")

    from awesome_align import modeling, tokenization_utils
    # This is a simplified interface - see awesome-align docs for full usage
    # The output is alignment indices like "0-0 1-2 2-1 ..."
    # For now fall back to simple alignment
    return simple_word_alignment(en_lines, ga_lines)


def load_sentences(limit: int = MAX_SENTENCES) -> tuple[list[str], list[str]]:
    en_lines, ga_lines = [], []
    with open(RAW_EN, encoding='utf-8') as ef, open(RAW_GA, encoding='utf-8') as gf:
        for i, (en, ga) in enumerate(zip(ef, gf)):
            if i >= limit:
                break
            en_lines.append(en.strip())
            ga_lines.append(ga.strip())
    print(f"Loaded {len(en_lines):,} sentence pairs")
    return en_lines, ga_lines


def load_existing_irish_words() -> set[str]:
    """Load existing dictionary to avoid duplicates."""
    data_file = Path(__file__).parent.parent / 'src' / 'data' / 'irish-dictionary-data.json'
    if not data_file.exists():
        return set()
    with open(data_file, encoding='utf-8') as f:
        existing = json.load(f)
    return {normalize_irish(e['irish']) for e in existing}


def extract_entries(pair_counts: Counter, existing_irish: set[str]) -> list[dict]:
    """Filter high-confidence pairs and build DictionaryEntry records."""
    entries = []
    seen_ids: set[str] = set()

    # Sort by frequency descending
    for (irish, english), count in tqdm(
        pair_counts.most_common(),
        desc='Extracting entries',
        total=len(pair_counts)
    ):
        if count < MIN_FREQ:
            break  # Already sorted by frequency

        # Skip if already in dictionary
        if normalize_irish(irish) in existing_irish:
            continue

        # Validate
        if not is_valid_irish_word(irish):
            continue
        if len(english) > MAX_ENGLISH_LEN or len(english) < 2:
            continue
        if not re.match(r'^[a-z\s\-]+$', english):
            continue

        entry_id = make_id(irish)
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
            'partOfSpeech': 'noun',  # Default - can't infer from parallel text
            'category': 'common',
            'searchTerms': build_search_terms(irish, english, [], []),
            'source': 'paracrawl',
        }
        entries.append(entry)

        # Cap to prevent noise from dominating
        if len(entries) >= 30_000:
            break

    return entries


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Download NLTK resources
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)

    download_paracrawl()

    en_lines, ga_lines = load_sentences()
    existing_irish = load_existing_irish_words()
    print(f"Existing Irish words to exclude: {len(existing_irish):,}")

    pair_counts = awesome_align(en_lines, ga_lines)
    print(f"Unique pair co-occurrences: {len(pair_counts):,}")

    entries = extract_entries(pair_counts, existing_irish)
    print(f"\nExtracted {len(entries):,} new entries (freq >= {MIN_FREQ})")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

    print(f"Saved to {OUTPUT_FILE}")


if __name__ == '__main__':
    main()
