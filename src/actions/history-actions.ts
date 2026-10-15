"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth"; 
import { prisma } from "@/lib/prisma"; 

const PAGE_SIZE = 30;

export type HistoryItem = {
  id: string;
  languageFrom: string;
  languageTo: string;
  sourceText: string;
  translatedText: string;
  createdAt: string; // ISO string, so it serializes cleanly to the client
};

export type HistoryPage =
  | { items: HistoryItem[]; nextCursor: string | null }
  | { error: "unauthenticated" };

async function getUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user.id ?? null;
  } catch {
    return null;
  }
}

// Returns up to 30 of the current user's translations, newest first.
// Pass the previous page's nextCursor to get the following 30.
export async function getTranslations(cursor?: string): Promise<HistoryPage> {
  // userId always comes from the session, so users can only ever read their own rows
  const userId = await getUserId();
  if (!userId) return { error: "unauthenticated" };

  const safeCursor =
    typeof cursor === "string" && cursor.length > 0 && cursor.length < 100 ? cursor : undefined;

  // Fetch one extra row: if it exists there's another page, and its id is the next cursor
  const rows = await prisma.translation.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
    ...(safeCursor ? { cursor: { id: safeCursor } } : {}),
    select: {
      id: true,
      languageFrom: true,
      languageTo: true,
      sourceText: true,
      translatedText: true,
      createdAt: true,
    },
  });

  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

  return {
    items: page.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    nextCursor: hasMore ? rows[PAGE_SIZE].id : null,
  };
}