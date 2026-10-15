import React from "react";

// Flags are drawn as inline SVG instead of emoji because Windows doesn't render flag emoji
// (it shows two letters like "GB" instead).

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
};

export const languageLabel = (code: string) =>
  LANGUAGE_LABELS[code] ?? code.toUpperCase();

type LanguageFlagProps = {
  code: string;
  className?: string;
};

export default function LanguageFlag({ code, className = "h-3.5 w-5" }: LanguageFlagProps) {
  const base = `${className} shrink-0 rounded-[3px] ring-1 ring-black/40`;

  switch (code) {
    case "en":
      return (
        <svg aria-hidden="true" viewBox="0 0 60 40" className={base}>
          <rect width="60" height="40" fill="#012169" />
          <path d="M0 0L60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
          <path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" strokeWidth="3" />
          <path d="M30 0V40M0 20H60" stroke="#fff" strokeWidth="12" />
          <path d="M30 0V40M0 20H60" stroke="#C8102E" strokeWidth="7" />
        </svg>
      );
    case "fr":
      return (
        <svg aria-hidden="true" viewBox="0 0 3 2" className={base}>
          <rect width="1" height="2" fill="#0055A4" />
          <rect x="1" width="1" height="2" fill="#fff" />
          <rect x="2" width="1" height="2" fill="#EF4135" />
        </svg>
      );
    case "es":
      return (
        <svg aria-hidden="true" viewBox="0 0 3 2" className={base}>
          <rect width="3" height="2" fill="#AA151B" />
          <rect y="0.5" width="3" height="1" fill="#F1BF00" />
        </svg>
      );
    default:
      // Unknown language code: neutral placeholder so the row still lines up
      return (
        <span
          aria-hidden="true"
          className={`${base} grid place-items-center bg-[#5A2B0C] text-[8px] font-bold text-[#FFB86B]`}
        >
          {code.slice(0, 2).toUpperCase()}
        </span>
      );
  }
}