"use client";

import { useState } from "react";
import DropDown from "@/components/dropDown";
import Navbar from "@/components/navbar";

/*
  Palette (from the PhotoFeed screenshot)
  peach   #FFB86B  nav, primary button, accents
  brown   #4A2208  page background
  deep    #3A1A06  input surfaces (a step darker than the page)
  rust    #B85C1E  borders
  ink     #5C2A0A  text on peach
*/

const languageOptions = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
];

const MAX_CHARS = 5000;

export default function Home() {
  const [languageFrom, setLanguageFrom] = useState("en");
  const [languageTo, setLanguageTo] = useState("es");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // If the user picks the language that's already on the other side, swap them
  const handleLanguageFromChange = (value: string) => {
    if (value === languageTo) setLanguageTo(languageFrom);
    setLanguageFrom(value);
  };

  const handleLanguageToChange = (value: string) => {
    if (value === languageFrom) setLanguageFrom(languageTo);
    setLanguageTo(value);
  };

  const handleSwap = () => {
    setLanguageFrom(languageTo);
    setLanguageTo(languageFrom);
    // carry the translation back into the input so the swap feels meaningful
    if (result) {
      setText(result);
      setResult("");
    }
  };

  const handleTranslate = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult("");
    try {
      // TODO: replace with your real translation call, e.g.
      // const res = await fetch("/api/translate", { method: "POST", body: JSON.stringify({ text, from: languageFrom, to: languageTo }) });
      await new Promise((r) => setTimeout(r, 800));
      setResult(`(${languageTo}) ${text}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const panel =
    "flex flex-col rounded-2xl border-2 border-[#B85C1E] bg-[#3A1A06] focus-within:border-[#FFB86B] transition-colors";
  const textareaBase =
    "min-h-[260px] w-full flex-1 resize-none bg-transparent px-5 pt-4 text-xl leading-relaxed text-white placeholder:text-[#FFB86B]/40 focus:outline-none";
  const ghostButton =
    "rounded-md px-2 py-1 text-sm font-medium text-[#FFB86B] transition-colors hover:bg-[#FFB86B]/10 focus-visible:outline-2 focus-visible:outline-[#FFB86B] disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="min-h-screen bg-[#FFB86B] text-white">
      <Navbar />

      <main className="mx-2 min-h-[calc(100vh-72px)] bg-[#4A2208] px-4 pb-16 pt-14 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-center text-4xl font-normal sm:text-5xl">
            Translate
          </h1>
          <p className="mt-3 text-center text-[#FFB86B]/80">
            Type or paste text, pick your languages, and translate.
          </p>

          <div className="mt-12 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
            {/* Source */}
            <section className={panel}>
              <div className="border-b border-[#B85C1E]/60 p-3">
                <DropDown
                  name="languageFrom"
                  label="Translate from"
                  value={languageFrom}
                  options={languageOptions}
                  onChange={handleLanguageFromChange}
                />
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
                    handleTranslate();
                }}
                placeholder="Enter text to translate"
                aria-label="Text to translate"
                className={textareaBase}
              />
              <div className="flex items-center justify-between px-4 pb-3 pt-2">
                <span className="text-sm tabular-nums text-[#FFB86B]/60">
                  {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setText("");
                    setResult("");
                  }}
                  disabled={!text}
                  className={ghostButton}
                >
                  Clear
                </button>
              </div>
            </section>

            {/* Swap */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap languages"
                className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#B85C1E] bg-[#4A2208] text-[#FFB86B] transition-colors hover:border-[#FFB86B] hover:bg-[#5A2B0C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB86B]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 rotate-90 md:rotate-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
                </svg>
              </button>
            </div>

            {/* Result */}
            <section className={`${panel} bg-[#351704]`}>
              <div className="border-b border-[#B85C1E]/60 p-3">
                <DropDown
                  name="languageTo"
                  label="Translate to"
                  value={languageTo}
                  options={languageOptions}
                  onChange={handleLanguageToChange}
                />
              </div>
              <div
                aria-live="polite"
                className="min-h-[260px] flex-1 px-5 pt-4 text-xl leading-relaxed"
              >
                {loading ? (
                  <span className="text-[#FFB86B]/60">Translating…</span>
                ) : result ? (
                  result
                ) : (
                  <span className="text-[#FFB86B]/40">
                    Your translation appears here
                  </span>
                )}
              </div>
              <div className="flex items-center justify-end px-4 pb-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!result}
                  className={ghostButton}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </section>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleTranslate}
              disabled={!text.trim() || loading}
              className="rounded-xl bg-[#FFB86B] px-10 py-3 text-lg font-bold text-[#4A2208] transition-colors hover:bg-[#FFC88A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFB86B] disabled:cursor-not-allowed disabled:bg-[#FFB86B]/30 disabled:text-[#FFB86B]/60"
            >
              {loading ? "Translating…" : "Translate"}
            </button>
            <p className="text-sm text-[#FFB86B]/60">
              Press Ctrl + Enter to translate
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
