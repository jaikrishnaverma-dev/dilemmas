/**
 * Multilingual UI utility.
 * Imports language-specific locale files and provides helpers.
 */
import en from '../locales/en';
import hinglish from '../locales/hinglish';
import hi from '../locales/hi';
import te from '../locales/te';

export const LANGUAGES = {
  ENGLISH: 'english',
  HINGLISH: 'hinglish',
  HINDI: 'hindi',
  TELUGU: 'telugu',
};

const TRANSLATIONS = {
  [LANGUAGES.ENGLISH]: en,
  [LANGUAGES.HINGLISH]: hinglish,
  [LANGUAGES.HINDI]: hi,
  [LANGUAGES.TELUGU]: te,
};

/**
 * Get the full copy object based on language.
 * Falls back to Hinglish if language is not found.
 */
export function getCopy(lang = LANGUAGES.ENGLISH) {
  return TRANSLATIONS[lang] || TRANSLATIONS[LANGUAGES.ENGLISH];
}

/** Legacy support (exported for components still using old pattern) */
export const COPY = TRANSLATIONS[LANGUAGES.ENGLISH];

/**
 * Get side label in current language.
 */
export function getSideLabel(side, lang = LANGUAGES.ENGLISH) {
  const currentCopy = getCopy(lang);
  return currentCopy.sides[side] || side;
}

/**
 * Get badge display name in current language.
 */
export function getBadgeLabel(badge, lang = LANGUAGES.ENGLISH) {
  const currentCopy = getCopy(lang);
  return currentCopy.badges[badge] || currentCopy.badges.none;
}
