"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ArrowRight, Lightbulb, X } from "lucide-react";
import LanguageFlag, { languageLabel } from "@/components/languageFlag";
import type { ExplainSuccess } from "@/actions/translate-actions";

type Props = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string;
  data: ExplainSuccess | null;
  from: string; // the language pair that was translated
  to: string;
  onRetry: () => void;
};

const TONE_LABEL = { formal: "Formal", neutral: "Neutral", casual: "Casual" } as const;

const bar = "rounded-full bg-[#FFB86B]/15 motion-safe:animate-pulse";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#FFB86B]/60">
        {title}
      </h3>
      {children}
    </section>
  );
}

function LoadingState() {
  return (
    <div role="status" aria-label="Explaining" className="space-y-4">
      <div className={`${bar} h-24 w-full rounded-xl`} />
      <div className={`${bar} h-4 w-1/3`} />
      <div className={`${bar} h-4 w-full`} />
      <div className={`${bar} h-4 w-4/5`} />
      <div className={`${bar} h-4 w-1/4`} />
      <div className={`${bar} h-16 w-full rounded-xl`} />
    </div>
  );
}

export default function ExplainDialog({
  open,
  onClose,
  loading,
  error,
  data,
  from,
  to,
  onRetry,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  // The native <dialog> gives us focus trapping, Esc to close and a backdrop for free.
  // This effect only keeps the element in step with the `open` prop.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const explanation = data?.explanation;
  const focus = data?.focus;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // clicks on the dimmed backdrop land on the dialog element itself
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="explain-title"
      className="m-auto max-h-[88vh] w-[min(92vw,640px)] overflow-hidden rounded-2xl border-2 border-[#B85C1E] bg-[#3A1A06] p-0 text-white shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[88vh] flex-col">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-[#B85C1E]/50 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#FFB86B] text-[#4A2208]">
              <Lightbulb aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 id="explain-title" className="text-lg font-bold leading-tight">
                Word help
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#FFB86B]/70">
                <LanguageFlag code={from} />
                {languageLabel(from)}
                <ArrowRight aria-hidden="true" className="h-3 w-3" />
                <LanguageFlag code={to} />
                {languageLabel(to)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#FFB86B] transition-colors hover:bg-[#FFB86B]/10 focus-visible:outline-2 focus-visible:outline-[#FFB86B]"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        {/* Body (scrolls if the content is long) */}
        <div className="overflow-y-auto px-5 pb-6 pt-5">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-4">
              <p role="alert" className="text-sm font-medium text-red-300">
                {error}
              </p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 rounded-lg border-2 border-[#B85C1E] px-4 py-1.5 text-sm font-semibold text-[#FFB86B] transition-colors hover:border-[#FFB86B] hover:bg-[#FFB86B]/10 focus-visible:outline-2 focus-visible:outline-[#FFB86B]"
              >
                Try again
              </button>
            </div>
          ) : explanation && focus ? (
            <div>
              {/* The text being explained */}
              <div className="rounded-xl border border-[#B85C1E]/60 bg-[#4A2208] p-4">
                <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FFB86B]/60">
                  <LanguageFlag code={focus.code} />
                  {languageLabel(focus.code)}
                </p>
                <p dir="auto" className="whitespace-pre-wrap break-words text-xl leading-relaxed">
                  {focus.text}
                </p>
                {explanation.pronunciation && (
                  <p className="mt-2 text-sm italic text-[#FFB86B]/70">
                    {explanation.pronunciation}
                  </p>
                )}
              </div>

              <Section title="Meaning">
                <p className="leading-relaxed text-white/90">{explanation.meaning}</p>
              </Section>

              <Section title="Tone">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[#FFB86B]/60 bg-[#FFB86B]/10 px-3 py-1 text-xs font-bold text-[#FFB86B]">
                    {TONE_LABEL[explanation.tone]}
                  </span>
                  {explanation.toneNote && (
                    <p className="min-w-0 flex-1 text-sm text-white/80">{explanation.toneNote}</p>
                  )}
                </div>
              </Section>

              {explanation.literal && (
                <Section title="Word for word">
                  <p className="rounded-lg border-l-4 border-[#B85C1E] bg-[#4A2208]/60 py-2 pl-4 pr-3 text-[#FFC88A]">
                    {explanation.literal}
                  </p>
                </Section>
              )}

              {explanation.keyWords.length > 0 && (
                <Section title="Key words">
                  <dl className="divide-y divide-[#B85C1E]/30 rounded-xl border border-[#B85C1E]/40">
                    {explanation.keyWords.map((k, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-2.5"
                      >
                        <dt dir="auto" className="font-semibold text-[#FFB86B]">
                          {k.word}
                        </dt>
                        <dd className="text-sm text-white/80">{k.meaning}</dd>
                      </div>
                    ))}
                  </dl>
                </Section>
              )}

              {explanation.examples.length > 0 && (
                <Section title="Examples">
                  <ul className="space-y-3">
                    {explanation.examples.map((e, i) => (
                      <li
                        key={i}
                        className="rounded-xl border border-[#B85C1E]/40 bg-[#4A2208]/50 px-4 py-3"
                      >
                        <p dir="auto" className="text-lg leading-snug">
                          {e.sentence}
                        </p>
                        <p className="mt-1 text-sm text-[#FFB86B]/70">{e.meaning}</p>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-4 border-t border-[#B85C1E]/50 px-5 py-3">
          <p className="text-xs text-[#FFB86B]/50">
            AI-generated. It can make mistakes, especially in less common languages.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg bg-[#FFB86B] px-4 py-1.5 text-sm font-bold text-[#4A2208] transition-colors hover:bg-[#FFC88A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB86B]"
          >
            Close
          </button>
        </footer>
      </div>
    </dialog>
  );
}