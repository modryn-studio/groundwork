# Groundwork — Copilot Context

## Who I Am
I'm Luke Hanner — a solo developer who ships AI-assisted tools fast, tests against real demand, and focuses on micro-niches. Groundwork is an idea-to-spec pipeline for developers who already know how to code. Drop a market and a rough idea. Agents research what people already pay for, surface the competitive gap, and guide you through three decisions. You get a completed `context.md` + `brand.md`, ready to drop into the boilerplate and run `/setup`.

## Deployment
<!-- Filled in by /setup from context.md.
     Read this before touching next.config.ts, BASE_PATH, site.ts, or any hardcoded URL.
     If mode is modryn-app:         basePath must stay set in next.config.ts.
     If mode is standalone-*:       basePath must be absent from next.config.ts. -->

mode: modryn-app
url:  https://modrynstudio.com/tools/groundwork
basePath: /tools/groundwork

## Stack
- Next.js 16 (App Router) with TypeScript
- Tailwind CSS for styling
- Vercel for deployment
- Vercel Analytics `<Analytics />` in `layout.tsx` — zero-config pageview tracking, no env vars needed
- `@/lib/analytics.ts` — no-op stub with named methods; wire in a real provider here if needed
- Resend — transactional email via `/api/feedback`
- Stripe — installed; not active in V1 (email-only)
- Lucide React — icons
- **Backend (not in this repo — separate Railway Python service):** LangGraph, FastAPI, Tavily Python SDK, OpenAI Python SDK, psycopg — see context.md for environment variables

## Project Structure
```
/app                    → Next.js App Router pages
/app/api                → API proxy routes (feedback, checkout)
/components             → Reusable UI components (EmailSignup, PayGate, FeedbackWidget)
/config                 → site.ts — single source of truth for metadata
/lib                    → Utilities, analytics stub, route-logger, cn
```

## Route Map
**Frontend (Next.js)**
- `/`                      → Home: market + idea input form; submits to FastAPI backend
- `/run/[threadId]`        → Pipeline progress + checkpoint UI; polls backend every 2s; error state handled inline
- `/privacy`               → Privacy policy
- `/terms`                 → Terms of service

**Backend (FastAPI on Railway — separate repo)**
- `POST /pipeline/start`          → Validate input, create LangGraph thread, return `{ thread_id }`
- `GET /pipeline/status/:id`      → Return `{ state, stage?, interrupt? }`
- `POST /pipeline/resume/:id`     → Send user decision via `Command(resume=...)`, return `{ state }`
- `GET /pipeline/result/:id`      → Return `{ context_md, brand_md }` when complete

## Brand & Voice

**Voice Rules**
- Short sentences. Builders skim. Get to the point.
- Talk to someone who has started and abandoned too many side projects in the research phase.
- You already know how to build. This clears the runway.
- Never use: "powerful", "seamless", "AI-powered", "unlock", "revolutionize", "validate", "supercharge"

**Target User**
A solo developer with an idea (or a market they care about) who wants to start building — not spend a week on research and positioning before touching code. They've done this the hard way before. They know the research is necessary. They don't want to do it manually again. Groundwork doesn't replace their judgment — it does the research and names the decisions so they can make them fast.

**Visual Rules**
- Dark mode only — builder tool, not a SaaS landing page
- Fonts: Space Grotesk (headings) + Space Mono (pipeline output, doc previews, file names)
- Motion: Minimal — one subtle progress indicator during pipeline runs only. Nothing decorative.
- Avoid: No rocket ships, lightbulbs, brain icons, or generic startup visual vocabulary

**Color System**
| Name       | Hex     | Role                                        |
| ---------- | ------- | ------------------------------------------- |
| Accent     | #F97415 | Amber — action, progress, CTAs              |
| Secondary  | #3B82F6 | Blue — checkpoint cards, decision prompts   |
| Background | #050505 | Near-black — base                           |
| Text       | #E5E5E5 | Off-white — body text                       |
| Muted      | #444444 | Borders, placeholders, stage labels         |
Amber = forward motion. Blue = your turn (checkpoint UI only). Never red except errors.

**Emotional Arc**
- Land: "This is the thing I've been doing manually in a conversation with ChatGPT"
- Read: "It actually outputs the files I need, not a summary to screenshot"
- Scroll: "I want to see what the checkpoint looks like"
- Convert: "I have an idea right now. I'm running it."

**Copy Reference**
- Hero: "Drop an idea. Get the docs."
- Sub: "You name the market. Agents find what's already selling. You decide the angle. You get context.md and brand.md, ready to build from."
- CTA: "Start the pipeline"
- Stage label (running): "Researching what people pay for..."
- Stage label (checkpoint): "Your turn."
- Checkpoint prompt: "Here's what the research found. Pick the gap you want to own."
- Completion: "Your docs are ready. Drop them in the boilerplate and run /setup."
- Against AI Cofounder: "Doesn't give you a report. Gives you the files."
- Against DIY ChatGPT: "You've done this in a chat window before. You know how it ends."
- Footer: "Built by a builder who got tired of doing research before the research."

## README Standard

Every project README follows this exact structure — no more, no less:

```markdown
![Project Name](public/brand/banner.png)

# Project Name

One-line tagline. Outcome-focused — lead with what the user gets, not the technology.

→ [domain.com](https://domain.com)

---

Next.js · TypeScript · Tailwind CSS · Vercel
```

Rules:
- **Banner image** — always first. Path is `public/brand/banner.png`.
- **H1 title** — product name only, no subtitle.
- **Tagline** — one sentence. What the user gets. No buzzwords ("powerful", "seamless", "AI-powered").
- **Live link** — `→ [domain.com](https://domain.com)` format. Always present if live.
- **Divider** — `---` separator before the stack line.
- **Stack line** — `·`-separated list of core tech only. No version numbers, no descriptions.
- **Nothing else.** No install instructions, no contributing section, no architecture diagrams, no screenshots beyond the banner. Real docs go in `/docs` or on the live site.

When adding a badge row (optional, for open source tools/libraries only):
- Place it between the H1 and the tagline
- Use shields.io format: `[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)`
- Keep it to 3 badges max: typically license + CI status + live site
- Apps (not libraries) should skip badges entirely

## Tailwind v4

This project uses Tailwind CSS v4. The rules are different from v3 — follow these exactly.

**Design tokens live in `@theme`, not `:root`:**

```css
/* ✅ correct — generates text-accent, bg-surface, border-border, etc. */
@theme {
  --color-accent: #F97415;    /* Amber — action, progress, CTAs */
  --color-secondary: #3B82F6; /* Blue — checkpoint cards, decision prompts */
  --color-bg: #050505;        /* Near-black — base background */
  --color-text: #E5E5E5;      /* Off-white — body text */
  --color-muted: #444444;     /* Borders, placeholders, stage labels */
  --color-surface: #111111;   /* Panel/card backgrounds */
  --color-border: #1A1A1A;    /* Subtle borders */
  --font-heading: var(--font-space-grotesk); /* Space Grotesk */
}

/* ❌ wrong — :root creates CSS variables but NO utility classes */
:root {
  --color-accent: #F97415;
}
```

**Use `(--color-*)` shorthand in class strings — never `[var(--color-*)]`:**
```tsx
// ✅ correct — TW v4 native shorthand
<div className="border-(--color-border) bg-(--color-surface) text-(--color-muted)" />

// ❌ wrong — v3 bracket notation, verbose and unnecessary in v4
<div className="border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]" />
```

If tokens are defined in `@theme`, you can also use the short utility names directly:
```tsx
// ✅ also correct when @theme is properly set up
<div className="border-border bg-surface text-muted text-accent" />
```

Never add `tailwind.config.*` — v4 has no config file. All theme customization goes in `globals.css` under `@theme`.

## API Route Logging

Every new API route (`app/api/**/route.ts`) MUST use `createRouteLogger` from `@/lib/route-logger`.

```typescript
import { createRouteLogger } from '@/lib/route-logger';
const log = createRouteLogger('my-route');

export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();
  try {
    log.info(ctx.reqId, 'Request received', { /* key fields */ });
    // ... handler body ...
    return log.end(ctx, Response.json(result), { /* key result fields */ });
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

- `begin()` prints the `─` separator + START line with a 5-char `reqId`
- `info()` / `warn()` log mid-request milestones
- `end()` logs ✅ with elapsed ms and returns the response
- `err()` logs ❌ with elapsed ms
- Never use raw `console.log` in routes — always go through the logger

## Analytics

Vercel Analytics (`<Analytics />` in `layout.tsx`) handles pageviews automatically — no config needed.

`@/lib/analytics.ts` is a no-op stub with named methods. Add a named method for each distinct user action — keeps events typed and discoverable. Wire in a real provider (PostHog, Mixpanel, etc.) inside `analytics.ts` if custom event tracking is needed later.

```typescript
import { analytics } from '@/lib/analytics';
analytics.track('event_name', { prop: value });
```

**Vercel plan check required before adding custom events.** Custom events require Vercel Pro ($20/mo) — they do not appear in the Vercel Analytics dashboard on Hobby. Adding real event calls without an upgraded plan creates dead code that misleads future readers. Before instrumenting scroll depth, click events, conversion tracking, screenshot views, or any custom event: confirm the plan. If on Hobby, keep `analytics.ts` as a no-op stub until the plan is upgraded or a different provider is explicitly wired in. Do not add GA4 or PostHog without explicit instruction — keep it simple.

## Dev Server

Start with `Ctrl+Shift+B` (default build task). This runs:
```
npm run dev -- --port 3000 2>&1 | Tee-Object -FilePath dev.log
```
Tell Copilot **"check logs"** at any point — it reads `dev.log` and flags errors or slow requests.

## Code Style
- Write as a senior engineer: minimal surface area, obvious naming, no abstractions before they're needed
- Comments explain WHY, not what
- One file = one responsibility
- Prefer early returns for error handling
- Never break existing functionality when adding new features
- Leave TODO comments for post-launch polish items

## Core Rules
- Every page earns its place — no pages for businesses not yet running
- Ship fast, stay honest — empty is better than fake
- Ugly is acceptable, broken is not — polish the core action ruthlessly
- Ship one killer feature, not ten mediocre ones
- Instrument analytics before features — data from day one
- Onboard users to value in under 2 minutes
