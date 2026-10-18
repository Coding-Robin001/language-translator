"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Check, Lightbulb, Loader2 } from "lucide-react";
import DropDown from "@/components/dropDown";
import VoiceRecorder, { type RecordedAudio } from "@/components/voice-recorder";
import { loadDraft, saveDraft, clearDraft, type Draft } from "@/lib/translateDraft";
import { languageOptions } from "@/lib/languages";
import ExplainDialog from "@/components/explainDialog";
import {
  translateText,
  transcribeAudio,
  saveTranslation,
  explainTranslation,
  type ExplainSuccess,
} from "@/actions/translate-actions";

/*
  Palette (from the PhotoFeed screenshot)
  peach   #FFB86B  nav, primary button, accents
  brown   #4A2208  page background
  deep    #3A1A06  input surfaces (a step darker than the page)
  rust    #B85C1E  borders
  ink     #5C2A0A  text on peach
*/

const MAX_CHARS = 5000;

type Notice = { type: "success" | "error"; text: string; signIn?: boolean };

function Translator({ initial }: { initial: Draft | null }) {
  const pathname = usePathname();

  // The draft was only needed to seed the state below, so remove it once we're mounted
  useEffect(() => {
    clearDraft();
  }, []);

  const [languageFrom, setLanguageFrom] = useState(initial?.languageFrom ?? "en");
  const [languageTo, setLanguageTo] = useState(initial?.languageTo ?? "es");
  const [text, setText] = useState(initial?.text ?? "");
  const [result, setResult] = useState(initial?.result ?? "");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Explain pop-up
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState("");
  const [explainData, setExplainData] = useState<ExplainSuccess | null>(null);
  // Remembers explanations already fetched, so reopening one costs no extra request
  const explainCache = useRef(new Map<string, ExplainSuccess>());
  const [error, setError] = useState("");
  const [transcribing, setTranscribing] = useState(false);

  // Save feature
  // `translated` is a snapshot of what was actually translated, so editing the
  // input afterwards can't get saved next to a translation of the old text.
  const [translated, setTranslated] = useState<Draft["translated"]>(
    initial?.translated ?? null,
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showNotice = (n: Notice | null, ttl?: number) => {
    clearTimeout(noticeTimer.current);
    setNotice(n);
    if (n && ttl) noticeTimer.current = setTimeout(() => setNotice(null), ttl);
  };

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
    setError("");
    showNotice(null);
    try {
      const res = await translateText(text, languageFrom, languageTo);
      if ("error" in res) {
        setError(res.error);
      } else {
        setResult(res.translation);
        setTranslated({ source: text, from: languageFrom, to: languageTo });
        setSaveState("idle");
      }
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !translated || saveState !== "idle") return;
    setSaveState("saving");
    showNotice(null);
    try {
      const res = await saveTranslation(
        translated.source,
        result,
        translated.from,
        translated.to,
      );
      if ("error" in res) {
        setSaveState("idle");
        showNotice({
          type: "error",
          text: res.error,
          signIn: res.code === "unauthenticated",
        });
      } else {
        setSaveState("saved");
        showNotice({ type: "success", text: "Saved to your history" }, 4000);
      }
    } catch {
      setSaveState("idle");
      showNotice({ type: "error", text: "Couldn't save. Try again." });
    }
  };

  const handleRecordingComplete = async ({
    base64,
    mimeType,
  }: RecordedAudio) => {
    setTranscribing(true);
    setError("");
    try {
      const res = await transcribeAudio(base64, mimeType);
      if ("error" in res) return setError(res.error);
      setText((prev) =>
        (prev ? `${prev} ${res.transcript}` : res.transcript).slice(
          0,
          MAX_CHARS,
        ),
      );
      setResult(""); // the old translation no longer matches the text
    } finally {
      setTranscribing(false);
    }
  };

  const handleExplain = async () => {
    if (!result || !translated) return;
    setExplainOpen(true);

    const key = `${translated.from}|${translated.to}|${translated.source}|${result}`;
    const cached = explainCache.current.get(key);
    if (cached) {
      setExplainData(cached);
      setExplainError("");
      return;
    }

    setExplainData(null);
    setExplainError("");
    setExplainLoading(true);
    try {
      const res = await explainTranslation(
        translated.source,
        result,
        translated.from,
        translated.to,
      );
      if ("error" in res) {
        setExplainError(res.error);
      } else {
        explainCache.current.set(key, res);
        setExplainData(res);
      }
    } catch {
      setExplainError("Something went wrong. Check your connection and try again.");
    } finally {
      setExplainLoading(false);
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
    <div className="min-h-[calc(100vh-72px)] bg-[#FFB86B] text-white">
      <main className="mx-2 min-h-[calc(100vh-72px)] bg-[#4A2208] px-4 pb-16 pt-6 sm:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Top bar: save status on the left, Save button pinned top-right */}
          <div className="flex h-10 items-center justify-end gap-3">
            {notice && (
              <p
                role={notice.type === "error" ? "alert" : "status"}
                className={`flex min-w-0 items-center gap-1.5 text-sm font-medium ${
                  notice.type === "error" ? "text-red-300" : "text-emerald-300"
                }`}
              >
                {notice.type === "success" && (
                  <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate">{notice.text}</span>
              </p>
            )}
            {notice?.signIn && (
              <Link
                href={`/auth?next=${encodeURIComponent(pathname)}`}
                onClick={() =>
                  saveDraft({ languageFrom, languageTo, text, result, translated })
                }
                className="shrink-0 text-sm font-semibold text-[#FFB86B] underline underline-offset-4 hover:text-[#FFC88A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB86B]"
              >
                Go to sign in
              </Link>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!result || !translated || saveState !== "idle"}
              className="inline-flex h-10 min-w-[104px] shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-[#B85C1E] bg-[#4A2208] px-4 text-sm font-semibold text-[#FFB86B] transition-colors hover:border-[#FFB86B] hover:bg-[#5A2B0C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB86B] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#B85C1E] disabled:hover:bg-[#4A2208]"
            >
              {saveState === "saving" ? (
                <>
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : saveState === "saved" ? (
                <>
                  <Check aria-hidden="true" className="h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark aria-hidden="true" className="h-4 w-4" />
                  Save
                </>
              )}
            </button>
          </div>

          <header className="mt-6 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Translate
            </h1>
            <p className="mt-3 text-xl font-bold text-[#FF9F3D] sm:text-2xl">
              Break language barriers, one translation at a time.
            </p>
            <div className="mx-auto mt-5 h-0.5 w-16 rounded-full bg-[#B85C1E]" />
            <p className="mt-5 text-base text-[#FFB86B]/70">
              Type or paste text, choose your languages, and translate.
            </p>
          </header>

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
                readOnly={transcribing}
                placeholder={
                  transcribing
                    ? "Transcribing your recording…"
                    : "Enter text to translate"
                }
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
                    handleTranslate();
                }}
                aria-label="Text to translate"
                dir="auto"
                className={textareaBase}
              />
              <div className="flex items-center justify-between px-4 pb-3 pt-2">
                <span className="text-sm tabular-nums text-[#FFB86B]/60">
                  {transcribing
                    ? "Transcribing…"
                    : `${text.length.toLocaleString()} / ${MAX_CHARS.toLocaleString()}`}
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
                dir="auto"
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
              <div className="flex items-center justify-end gap-1 px-4 pb-3 pt-2">
                <button
                  type="button"
                  onClick={handleExplain}
                  disabled={!result || !translated}
                  className={`${ghostButton} cursor-pointer  inline-flex items-center gap-1.5`}
                >
                  <Lightbulb aria-hidden="true" className="h-4 w-4" />
                  Explain
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!result}
                  className={`${ghostButton} cursor-pointer`}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </section>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <button
                type="button"
                onClick={handleTranslate}
                disabled={!text.trim() || loading || transcribing}
                className="rounded-xl bg-[#FFB86B] px-10 py-3 text-lg font-bold text-[#4A2208] transition-colors hover:bg-[#FFC88A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFB86B] disabled:cursor-not-allowed disabled:bg-[#FFB86B]/30 disabled:text-[#FFB86B]/60"
              >
                {loading ? "Translating…" : "Translate"}
              </button>
              <VoiceRecorder
                disabled={languageFrom !== "en" || transcribing}
                onRecordingComplete={handleRecordingComplete}
              />
            </div>
            {error ? (
              <p role="alert" className="text-sm font-medium text-[#FFD4A3]">
                {error}
              </p>
            ) : (
              <p className="text-sm text-[#FFB86B]/60">
                Press Ctrl + Enter to translate
              </p>
            )}
          </div>
        </div>
      </main>

      <ExplainDialog
        open={explainOpen}
        onClose={() => setExplainOpen(false)}
        loading={explainLoading}
        error={explainError}
        data={explainData}
        from={translated?.from ?? languageFrom}
        to={translated?.to ?? languageTo}
        onRetry={handleExplain}
      />
    </div>
  );
}

const subscribe = () => () => {};

export default function TranslatorApp() {
  // false during server render and hydration, true afterwards. This lets us read
  // sessionStorage without a hydration mismatch and without setState in an effect.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#FFB86B]">
        <div className="mx-2 min-h-[calc(100vh-72px)] bg-[#4A2208]" />
      </div>
    );
  }

  return <Translator initial={loadDraft()} />;
}