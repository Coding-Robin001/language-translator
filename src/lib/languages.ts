// The one place that defines which languages the app supports.
//
// To add a language: add one object to LANGUAGES below.
// If it needs a flag that doesn't exist yet, also add one case in components/language-flag.tsx
// (or just use flag: "badge" with a short badge text, which needs no other change).
// The dropdowns, validation, prompts, history page and flags all read from this list.

export type Language = {
  code: string; // stored in the database and used in the UI, e.g. "en"
  name: string; // shown in dropdowns and lists
  flag: "gb" | "fr" | "es" | "de" | "jp" | "ng" | "badge";
  badge?: string; // the text shown when flag is "badge"
  hint?: string; // extra instruction for Gemini when translating INTO this language
};

export const LANGUAGES = [
  { code: "en", name: "English", flag: "gb" },
  { code: "fr", name: "French", flag: "fr" },
  { code: "es", name: "Spanish", flag: "es" },
  { code: "de", name: "German", flag: "de" },
  {
    code: "ar",
    name: "Arabic",
    flag: "badge",
    badge: "ع", // Arabic is spoken in many countries, so a script badge instead of a country flag
    hint: "Use Modern Standard Arabic.",
  },
  {
    code: "ja",
    name: "Japanese",
    flag: "jp",
    hint: "Use natural, polite Japanese unless the text is clearly casual.",
  },
  {
    code: "yo",
    name: "Yoruba",
    flag: "ng",
    hint: "Keep all Yoruba tone marks and diacritics (for example à, á, ẹ, ọ, ṣ).",
  },
  {
    code: "ig",
    name: "Igbo",
    flag: "ng",
    hint: "Use standard Igbo orthography, including the dot-below vowels ị, ọ and ụ.",
  },
  {
    code: "ha",
    name: "Hausa",
    flag: "ng",
    hint: "Use standard Hausa orthography, including the hooked letters ɓ, ɗ and ƙ.",
  },
] as const satisfies readonly Language[];

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const isLanguage = (value: string): value is LanguageCode =>
  LANGUAGES.some((l) => l.code === value);

export const getLanguage = (code: string): Language | undefined =>
  LANGUAGES.find((l) => l.code === code);

// Ready-made options for the <DropDown> component
export const languageOptions = LANGUAGES.map((l) => ({
  value: l.code as string,
  label: l.name as string,
}));