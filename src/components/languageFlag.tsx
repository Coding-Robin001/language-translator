import React from "react";
import { getLanguage } from "@/lib/languages";

// Flags are drawn as inline SVG instead of emoji because Windows doesn't render flag emoji
// (it shows two letters like "GB" instead). Which flag a language uses is set in lib/languages.ts.

export const languageLabel = (code: string) =>
  getLanguage(code)?.name ?? code.toUpperCase();

type LanguageFlagProps = {
  code: string; // a language code such as "en"
  className?: string;
};

export default function LanguageFlag({ code, className = "h-3.5 w-5" }: LanguageFlagProps) {
  const base = `${className} shrink-0 rounded-[3px] ring-1 ring-black/40`;
  const language = getLanguage(code);

  switch (language?.flag) {
    case "gb":
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
    case "de":
      return (
        <svg aria-hidden="true" viewBox="0 0 5 3" className={base}>
          <rect width="5" height="1" fill="#000" />
          <rect y="1" width="5" height="1" fill="#DD0000" />
          <rect y="2" width="5" height="1" fill="#FFCE00" />
        </svg>
      );
    case "jp":
      return (
        <svg aria-hidden="true" viewBox="0 0 3 2" className={base}>
          <rect width="3" height="2" fill="#fff" />
          <circle cx="1.5" cy="1" r="0.6" fill="#BC002D" />
        </svg>
      );
    case "ng":
      return (
        <svg aria-hidden="true" viewBox="0 0 3 2" className={base}>
          <rect width="1" height="2" fill="#008751" />
          <rect x="1" width="1" height="2" fill="#fff" />
          <rect x="2" width="1" height="2" fill="#008751" />
        </svg>
      );
    case "badge":
      // For languages without one obvious country flag, e.g. Arabic
      return (
        <span
          aria-hidden="true"
          className={`${base} grid place-items-center bg-[#5A2B0C] text-[10px] font-bold leading-none text-[#FFB86B]`}
        >
          {language.badge}
        </span>
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