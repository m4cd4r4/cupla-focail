"""Shared utilities for all import scripts."""

import re
import unicodedata

FADA_MAP = str.maketrans('áéíóúÁÉÍÓÚ', 'aeiouAEIOU')

VALID_POS = {
    'noun', 'verb', 'adjective', 'adverb', 'phrase',
    'pronoun', 'preposition', 'conjunction', 'interjection', 'numeral',
}

VALID_CATEGORIES = {
    'family', 'greetings', 'emotions', 'time', 'food',
    'body', 'nature', 'home', 'school', 'travel',
    'numbers', 'colors', 'common', 'conversation',
    'health', 'weather', 'sports', 'work', 'places',
    'clothing', 'music', 'culture', 'animals',
    'religion', 'law', 'science', 'technology', 'agriculture',
    'mythology', 'arts', 'military', 'politics', 'business',
    'geography', 'plants',
}

IRISH_CHAR_PATTERN = re.compile(r'^[a-zA-ZáéíóúÁÉÍÓÚ\s\-\']+$')


def normalize_irish(text: str) -> str:
    """Strip fadas and lowercase - mirrors the TypeScript normalizeIrish()."""
    return text.translate(FADA_MAP).lower()


def make_id(irish: str) -> str:
    """Generate ASCII slug from an Irish word."""
    normalized = normalize_irish(irish)
    slug = re.sub(r'[^a-z0-9]+', '-', normalized).strip('-')
    return slug


def build_search_terms(irish: str, english: str, english_alt: list[str], inflections: list[str]) -> list[str]:
    """Build the searchTerms array - includes all normalized forms."""
    terms = set()
    terms.add(normalize_irish(irish))
    terms.add(english.lower())
    for alt in english_alt:
        terms.add(alt.lower())
    for form in inflections:
        terms.add(normalize_irish(form))
    return sorted(terms)


def is_valid_irish_word(word: str) -> bool:
    """Basic validation that a string looks like an Irish word."""
    if not word or len(word) < 2 or len(word) > 60:
        return False
    return bool(IRISH_CHAR_PATTERN.match(word))


def map_pos(raw_pos: str) -> str:
    """Map various POS tag formats to our PartOfSpeech type."""
    pos_map = {
        'noun': 'noun', 'n': 'noun',
        'verb': 'verb', 'v': 'verb',
        'adj': 'adjective', 'adjective': 'adjective',
        'adv': 'adverb', 'adverb': 'adverb',
        'phrase': 'phrase', 'ph': 'phrase',
        'pron': 'pronoun', 'pronoun': 'pronoun',
        'prep': 'preposition', 'preposition': 'preposition',
        'conj': 'conjunction', 'conjunction': 'conjunction',
        'intj': 'interjection', 'interjection': 'interjection',
        'num': 'numeral', 'numeral': 'numeral', 'number': 'numeral',
    }
    mapped = pos_map.get(raw_pos.lower().strip(), 'noun')
    return mapped if mapped in VALID_POS else 'noun'


# WordNet lexicographer file → our category
WORDNET_DOMAIN_TO_CATEGORY = {
    'noun.person': 'family',
    'noun.animal': 'animals',
    'noun.plant': 'plants',
    'noun.food': 'food',
    'noun.body': 'body',
    'noun.artifact': 'home',
    'noun.location': 'places',
    'noun.substance': 'nature',
    'noun.object': 'nature',
    'noun.natural_object': 'nature',
    'noun.phenomenon': 'weather',
    'noun.shape': 'common',
    'noun.attribute': 'common',
    'noun.state': 'emotions',
    'noun.feeling': 'emotions',
    'noun.cognition': 'school',
    'noun.communication': 'conversation',
    'noun.event': 'common',
    'noun.act': 'common',
    'noun.group': 'common',
    'noun.time': 'time',
    'noun.possession': 'common',
    'noun.quantity': 'numbers',
    'noun.relation': 'common',
    'noun.motive': 'emotions',
    'noun.process': 'common',
    'noun.tops': 'common',
    # Verb domains
    'verb.body': 'health',
    'verb.change': 'common',
    'verb.cognition': 'school',
    'verb.communication': 'conversation',
    'verb.competition': 'sports',
    'verb.consumption': 'food',
    'verb.contact': 'common',
    'verb.creation': 'arts',
    'verb.emotion': 'emotions',
    'verb.motion': 'travel',
    'verb.perception': 'common',
    'verb.possession': 'work',
    'verb.social': 'common',
    'verb.stative': 'common',
    'verb.weather': 'weather',
    # Adjective domains
    'adj.all': 'common',
    'adj.pert': 'common',
    'adj.ppl': 'common',
    # Adverb
    'adv.all': 'common',
    # Extra topic domains
    'religion': 'religion',
    'law': 'law',
    'science': 'science',
    'technology': 'technology',
    'agriculture': 'agriculture',
    'mythology': 'mythology',
    'arts': 'arts',
    'military': 'military',
    'politics': 'politics',
    'business': 'business',
    'geography': 'geography',
}

# Wiktionary topic → our category
WIKTIONARY_TOPIC_TO_CATEGORY = {
    'Irish mythology': 'mythology',
    'Celtic mythology': 'mythology',
    'Mythology': 'mythology',
    'Religion': 'religion',
    'Christianity': 'religion',
    'Catholicism': 'religion',
    'Law': 'law',
    'Legal': 'law',
    'Science': 'science',
    'Biology': 'science',
    'Chemistry': 'science',
    'Physics': 'science',
    'Technology': 'technology',
    'Computing': 'technology',
    'Internet': 'technology',
    'Agriculture': 'agriculture',
    'Farming': 'agriculture',
    'Arts': 'arts',
    'Theatre': 'arts',
    'Visual arts': 'arts',
    'Military': 'military',
    'War': 'military',
    'Politics': 'politics',
    'Government': 'politics',
    'Business': 'business',
    'Finance': 'business',
    'Economics': 'business',
    'Geography': 'geography',
    'Botany': 'plants',
    'Plants': 'plants',
    'Anatomy': 'body',
    'Medicine': 'health',
    'Food': 'food',
    'Cooking': 'food',
    'Family': 'family',
    'Animals': 'animals',
    'Zoology': 'animals',
    'Weather': 'weather',
    'Sports': 'sports',
    'Music': 'music',
    'Clothing': 'clothing',
    'Fashion': 'clothing',
    'Travel': 'travel',
    'Transport': 'travel',
    'Colors': 'colors',
    'Colours': 'colors',
    'Numbers': 'numbers',
    'Mathematics': 'numbers',
    'Nature': 'nature',
    'Environment': 'nature',
    'School': 'school',
    'Education': 'school',
    'Time': 'time',
    'Home': 'home',
    'Emotions': 'emotions',
    'Work': 'work',
    'Employment': 'work',
    'Places': 'places',
}
