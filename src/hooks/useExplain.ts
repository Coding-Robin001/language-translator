"use client";

import { useRef, useState } from "react";
import { explainTranslation, type ExplainSuccess } from "@/actions/translate-actions";
import type { ExplainDialogProps } from "@/components/explainDialog";

export type ExplainRequest = {
  source: string; // the text that was translated
  translated: string; // the translation
  from: string; // language codes
  to: string;
};

// Everything the Explain pop-up needs: the request, the cache and the dialog state.
//
// Usage in any client component:
//   const { explain, dialogProps } = useExplain();
//   <button onClick={() => explain({ source, translated, from, to })}>Explain</button>
//   <ExplainDialog {...dialogProps} />
export function useExplain() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ExplainSuccess | null>(null);
  const [current, setCurrent] = useState<ExplainRequest | null>(null);

  // Explanations already fetched, so reopening one costs no extra Gemini request
  const cache = useRef(new Map<string, ExplainSuccess>());
  // Lets us ignore a late reply if the user clicked Explain on something else meanwhile
  const latestRequest = useRef(0);

  const explain = async (request: ExplainRequest) => {
    const requestId = ++latestRequest.current;
    setCurrent(request);
    setOpen(true);
    setError("");

    const key = JSON.stringify([request.from, request.to, request.source, request.translated]);
    const cached = cache.current.get(key);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    setData(null);
    setLoading(true);
    try {
      const res = await explainTranslation(
        request.source,
        request.translated,
        request.from,
        request.to,
      );
      if (requestId !== latestRequest.current) return;
      if ("error" in res) {
        setError(res.error);
      } else {
        cache.current.set(key, res);
        setData(res);
      }
    } catch {
      if (requestId !== latestRequest.current) return;
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  };

  const dialogProps: ExplainDialogProps = {
    open,
    onClose: () => setOpen(false),
    loading,
    error,
    data,
    from: current?.from ?? "",
    to: current?.to ?? "",
    onRetry: () => {
      if (current) explain(current);
    },
  };

  return { explain, dialogProps };
}