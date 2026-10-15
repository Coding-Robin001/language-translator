import Link from "next/link";
import { redirect } from "next/navigation";
import TranslationHistory from "@/components/translationsHistory";
import { getTranslations } from "@/actions/history-actions";

export const metadata = { title: "Translations" };

export default async function TranslationsPage() {
  const first = await getTranslations();

  // Not signed in: send them to /auth and bring them back here afterwards
  if ("error" in first) {
    redirect(`/auth?next=${encodeURIComponent("/translations")}`);
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#FFB86B] text-white">
      <main className="mx-2 min-h-[calc(100vh-72px)] bg-[#4A2208] px-4 pb-16 pt-10 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-normal sm:text-5xl">Translations</h1>
              <p className="mt-2 text-[#FFB86B]/80">
                Everything you saved, newest first. Select a row to see the full text.
              </p>
            </div>
            <Link
              href="/"
              className="rounded-xl bg-[#FFB86B] px-5 py-2.5 text-sm font-bold text-[#4A2208] transition-colors hover:bg-[#FFC88A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFB86B]"
            >
              New translation
            </Link>
          </div>

          <div className="mt-10">
            <TranslationHistory initialItems={first.items} initialCursor={first.nextCursor} />
          </div>
        </div>
      </main>
    </div>
  );
}