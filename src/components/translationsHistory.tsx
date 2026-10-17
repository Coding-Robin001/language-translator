"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronDown, Copy, Languages, Loader2 } from "lucide-react";
import LanguageFlag, { languageLabel } from "@/components/languageFlag";
import { getTranslations, type HistoryItem } from "@/actions/history-actions";

// Shared by the column header and every row so the columns line up
const COLS = "md:grid-cols-[152px_minmax(0,1fr)_minmax(0,1fr)_120px]";

const rowDate = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const fullDate = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

type Props = {
  initialItems: HistoryItem[];
  initialCursor: string | null;
};

function LanguagePair({ from, to, className = "" }: { from: string; to: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#B85C1E]/50 bg-[#4A2208] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#FFB86B] ${className}`}
    >
      <LanguageFlag code={from} />
      {from}
      <ArrowRight aria-hidden="true" className="h-3 w-3 text-[#FFB86B]/60" />
      <LanguageFlag code={to} />
      {to}
    </span>
  );
}

export default function TranslationHistory({ initialItems, initialCursor }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const res = await getTranslations(cursor);
      if ("error" in res) {
        // session expired while the page was open
        router.replace(`/auth?next=${encodeURIComponent("/translations")}`);
        return;
      }
      setItems((prev) => [...prev, ...res.items]);
      setCursor(res.nextCursor);
    } catch {
      setError("Couldn't load more translations. Try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCopy = async (item: HistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.translatedText);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId((c) => (c === item.id ? null : c)), 1500);
    } catch {
      // clipboard blocked: nothing useful to show
    }
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[#B85C1E] bg-[#3A1A06]/60 px-6 py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-[#B85C1E] bg-[#4A2208] text-[#FFB86B]">
          <Languages aria-hidden="true" className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold">No translations available</h2>
        <p className="mt-2 max-w-sm text-[#FFB86B]/70">
          Translations you save will show up here, newest first.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-xl bg-[#FFB86B] px-6 py-3 font-bold text-[#4A2208] transition-colors hover:bg-[#FFC88A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFB86B]"
        >
          Start translating
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Column headings (desktop only) */}
      <div
        aria-hidden="true"
        className={`mb-2 hidden gap-x-4 px-4 text-xs font-semibold uppercase tracking-wider text-[#FFB86B]/50 md:grid ${COLS}`}
      >
        <span>Languages</span>
        <span>Source</span>
        <span>Translation</span>
        <span className="text-right">Saved</span>
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <li
              key={item.id}
              className={`rounded-xl border bg-[#3A1A06] transition-colors ${
                open ? "border-[#FFB86B]" : "border-[#B85C1E]/60 hover:border-[#FFB86B]/60"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                aria-expanded={open}
                aria-controls={`detail-${item.id}`}
                className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-xl px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB86B] md:gap-y-0 ${COLS}`}
              >
                <LanguagePair
                  from={item.languageFrom}
                  to={item.languageTo}
                  className="order-1 justify-self-start md:order-none"
                />

                <span dir="auto" className="order-3 col-span-2 truncate text-white md:order-none md:col-span-1">
                  {item.sourceText}
                </span>

                <span className="order-4 col-span-2 flex min-w-0 items-center gap-2 text-[#FFB86B] md:order-none md:col-span-1">
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 md:hidden" />
                  <span dir="auto" className="truncate">{item.translatedText}</span>
                </span>

                <span className="order-2 flex items-center justify-end gap-2 text-xs text-[#FFB86B]/70 md:order-none">
                  {/* browser timezone/locale can differ from the server's, so skip the hydration check here */}
                  <time dateTime={item.createdAt} suppressHydrationWarning>
                    {rowDate.format(new Date(item.createdAt))}
                  </time>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </span>
              </button>

              {open && (
                <div
                  id={`detail-${item.id}`}
                  className="grid gap-5 border-t border-[#B85C1E]/40 px-4 pb-4 pt-4 md:grid-cols-2"
                >
                  <div>
                    <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FFB86B]/60">
                      <LanguageFlag code={item.languageFrom} />
                      {languageLabel(item.languageFrom)}
                    </p>
                    <p dir="auto" className="whitespace-pre-wrap break-words text-lg leading-relaxed text-white">
                      {item.sourceText}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FFB86B]/60">
                      <LanguageFlag code={item.languageTo} />
                      {languageLabel(item.languageTo)}
                    </p>
                    <p dir="auto" className="whitespace-pre-wrap break-words text-lg leading-relaxed text-[#FFC88A]">
                      {item.translatedText}
                    </p>
                  </div>
                  <div className="flex items-center justify-between md:col-span-2">
                    <time className="text-xs text-[#FFB86B]/60">
                      {fullDate.format(new Date(item.createdAt))}
                    </time>
                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-[#FFB86B] transition-colors hover:bg-[#FFB86B]/10 focus-visible:outline-2 focus-visible:outline-[#FFB86B]"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check aria-hidden="true" className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy aria-hidden="true" className="h-4 w-4" />
                          Copy translation
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Footer: count, error and load more */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {error && (
          <p role="alert" className="text-sm font-medium text-red-300">
            {error}
          </p>
        )}
        {cursor ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex h-11 min-w-[160px] items-center justify-center gap-2 rounded-xl border-2 border-[#B85C1E] bg-[#4A2208] px-6 text-sm font-semibold text-[#FFB86B] transition-colors hover:border-[#FFB86B] hover:bg-[#5A2B0C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB86B] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? (
              <>
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </button>
        ) : (
          <p className="text-sm text-[#FFB86B]/50">
            That&apos;s everything. {items.length.toLocaleString()} saved{" "}
            {items.length === 1 ? "translation" : "translations"}.
          </p>
        )}
      </div>
    </div>
  );
}