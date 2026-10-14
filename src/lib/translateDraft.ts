// Keeps the translator's state in sessionStorage while the user goes off to sign in.
// sessionStorage survives navigation within the same tab and is cleared when the tab closes.

export type Draft = {
  languageFrom: string;
  languageTo: string;
  text: string;
  result: string;
  translated: { source: string; from: string; to: string } | null;
};

const KEY = "translate-draft";
const MAX_AGE_MS = 30 * 60 * 1000; // ignore drafts older than 30 minutes

export function saveDraft(draft: Draft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ draft, savedAt: Date.now() }));
  } catch {
    // storage unavailable (private mode, quota): the user just loses the draft
  }
}

export function loadDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const { draft, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > MAX_AGE_MS) return null;
    if (typeof draft?.text !== "string" || typeof draft?.result !== "string") return null;
    return draft as Draft;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
}