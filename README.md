# Translator App

An AI-powered translator built with Next.js, Google Gemini and Better Auth. Translate between nine languages (including Yoruba, Igbo and Hausa), dictate in English, get structured word help, and keep a personal history of saved translations.

<!-- Add a screenshot: ![Translator app](docs/screenshot.png) -->

## Features

- **Translate** between English, French, Spanish, German, Arabic, Japanese, Yoruba, Igbo and Hausa. Swap languages with one click, up to 5,000 characters, `Ctrl + Enter` to translate.
- **Voice input.** Record English speech and Gemini transcribes it into the input box, so you can review it before translating.
- **Explain ("Word help").** A pop-up with the meaning, tone, word-for-word version, pronunciation, key words and example sentences. Gemini returns it as structured JSON, so each part is laid out in its own section. Available on the translator and on the history page.
- **Save and history.** Anyone can translate, but only signed-in users can save. The history page shows 30 translations at a time, newest first, with expandable rows, copy and explain.
- **Authentication.** Email and password, plus Google and GitHub sign-in. Signing in sends you back to the page you came from, and an unsaved translation is restored.
- **Rate limiting and model fallback.** Per-user request limits, and an automatic fallback to a second Gemini model if the first one fails or runs out of quota.
- **Right-to-left support** for Arabic input and output.

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js (App Router, Server Actions), React, TypeScript |
| Styling | Tailwind CSS, lucide-react icons |
| AI | Google Gemini via `@google/genai` |
| Auth | Better Auth |
| Database | PostgreSQL (Neon) with Prisma |

## Getting started

**Prerequisites:** Node.js 20+, a PostgreSQL database (a free [Neon](https://neon.tech) project works), and a Gemini API key from [Google AI Studio](https://aistudio.google.com).

```bash
git clone https://github.com/<your-username>/translator-app.git
cd translator-app
npm install
```

Create a `.env` file in the project root:

```env
# PostgreSQL connection string (sslmode=verify-full avoids a pg SSL warning)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=verify-full"

# Google AI Studio key
GEMINI_API_KEY="your-gemini-key"

# Better Auth
BETTER_AUTH_SECRET="a-long-random-string"
BETTER_AUTH_URL="http://localhost:3000"

# Only needed for the Google / GitHub sign-in buttons
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

Set up the database and start the app:

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Access | What it is |
|---|---|---|
| `/` | Public | The translator |
| `/translations` | Signed in (redirects to `/auth`) | Saved translation history |
| `/auth` | Public | Sign in and sign up |
| `/auth-dashboard` | Signed in | Account page |

## Project structure

```
src/
  app/
    page.tsx                  Translator page
    layout.tsx                Root layout with the navbar
    translations/             History page, with loading.tsx
    auth/                     Sign in and sign up
    auth-dashboard/           Account page, with loading.tsx
  actions/
    translate-actions.ts      Translate, transcribe, explain, save, rate limiting, model fallback
    history-actions.ts        Paginated history query
    auth-actions.ts           Sign in, sign up, sign out
  components/                 translator-app, translation-history, explain-dialog,
                              voice-recorder, language-flag, navbar, ...
  hooks/
    use-explain.ts            Explain request, cache and dialog state
  lib/
    languages.ts              Supported languages (single source of truth)
    auth.ts, prisma.ts        Auth and database clients
    translate-draft.ts        Keeps unsaved work while the user signs in
    safe-redirect.ts          Safe "return to this page" after sign-in
prisma/
  schema.prisma
```

## Configuration

**Add a language.** Add one line to `src/lib/languages.ts`. The dropdowns, validation, prompts, flags and history page all read from that list, and there is no database migration.

```ts
{ code: "sw", name: "Swahili", flag: "badge", badge: "SW" },
```

Each entry can also carry a `hint`, an extra instruction for Gemini when translating into that language (for example, keeping Yoruba tone marks).

**Models and limits.** The settings block at the top of `src/actions/translate-actions.ts` holds the values you are most likely to change:

```ts
const PRIMARY_MODEL = "gemini-3.5-flash-lite";
const FALLBACK_MODEL = "gemini-3.1-flash-lite";

const GUEST_LIMIT = 5;   // Gemini requests per minute, signed-out visitors (per IP)
const USER_LIMIT = 10;   // Gemini requests per minute, signed-in users
```

## How it works

- **Server Actions, no REST API.** The browser calls server functions directly. Every action re-validates its input, because Server Actions are public endpoints.
- **User identity comes from the session**, never from the client, for saving and for reading history.
- **Prompt-injection guard.** User text is wrapped in tags and Gemini is told to treat it as content, never as instructions.
- **Structured output.** Explain sends Gemini a JSON schema, then validates and trims the reply before it reaches the UI.
- **Shared rate limit.** Translate, transcribe and explain draw from one per-minute allowance, tracked per user or per IP address.
- **Cursor pagination.** History loads 30 rows at a time and stays correct when new rows are saved while you browse.
- **Open-redirect protection.** The `?next=` return path after sign-in only accepts same-site paths.

## Database

Better Auth manages the `user`, `session`, `account` and `verification` tables. The app adds one table:

| `translation` | |
|---|---|
| `id` | Primary key |
| `userId` | Owner (cascade delete) |
| `languageFrom`, `languageTo` | Language codes such as `en` or `yo` |
| `sourceText`, `translatedText` | The saved pair |
| `createdAt` | Indexed with `userId` for fast history queries |

## Known limitations

- **Rate-limit counters are in memory.** This works on a single server or in development. On serverless hosts such as Vercel, each instance counts separately, so limits are approximate. Use a shared store such as Upstash Redis for strict limits.
- **Gemini free-tier quotas are per project and per model**, and are shared by all your users. Check your limits in Google AI Studio.
- **Translation quality varies by language.** Yoruba, Igbo and Hausa are noticeably weaker than the major languages.
- **Voice input is English only.**
- **Explanations are written in English**, and are cached in the browser tab only.

## Design

The interface uses a warm cocoa palette: peach `#FFB86B`, deep brown `#4A2208`, input brown `#3A1A06`, rust `#B85C1E` and ink `#5C2A0A`.
