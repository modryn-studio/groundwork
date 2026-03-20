# Project Context

## Product

Groundwork — idea-to-spec pipeline for solo builders. Dump your ideas. The pipeline identifies the market you care about, researches what people already pay for, surfaces the competitive gap, and guides you through 3 decisions. You get a completed `context.md` + `brand.md`, ready to drop into the boilerplate and run `/setup`.

## Core Framework

**The mental model Groundwork operationalizes:**

1. Find a market you care about
2. Copy a product people already pay for
3. Add your signature to make it yours

In pipeline terms: **idea backlog → market identification → find what people pay for → differentiation decision → docs**

Operationally: **builder dumps ideas over time → pipeline identifies the market → agents find what's already selling → builder decides the angle**

The builder supplies the raw ideas. The pipeline identifies step 1 from them. The agents execute step 2. The human checkpoints force step 3. The output is step 4 — the actual files to build from.

**"What people already pay for" is the clearest signal, not the only one.** For developer tool markets, GitHub stars, forks, and derivative tools built on top of a repo are equivalent demand signals — proven interest without a paywall. The research agents should treat high-star open-source repos in a market the same way they treat paid competitors: what problem does it solve, what do people complain about, where is it incomplete?

**The dump is the primary intake, but not the only path.** The builder maintains an idea backlog inside Groundwork. When ready to run, they hit run — the pipeline reads their ideas and surfaces markets those ideas cluster around. Alternatively, the builder can skip the dump and signal a market directly: by naming it (free text), naming a competitor, or naming a subreddit. All paths produce the same `MarketSignal` that Stage 0 consumes. The first checkpoint is always a market confirmation, not a blank input.

---

## Target User

A solo builder who already knows how to code. They have an idea — or a market they care about — but don't want to spend a half-day doing research, competitive analysis, and positioning work before they can start building. They're not looking for validation theater. They want the research done and the decisions forced so they can move.

## Deployment

mode: modryn-app

modrynstudio.com has a verified **Domain property** in Google Search Console. All tools under that domain are covered automatically. Never walk through domain verification steps — just submit the tool sitemap to the existing property.
url: https://modrynstudio.com/tools/groundwork
basePath: /tools/groundwork

## Minimum Money Loop

V1 is invite-only / unlisted — no paygate. Luke uses it himself first. After 3+ real runs produce output quality within 20 minutes of manual editing, open it to builders and add an email gate. Paygate TBD after validation — likely $9/3 runs or monthly flat.

## Architecture

**Two-service architecture:**

- **Next.js frontend** (existing modryn-studio-v2 boilerplate) — input form, pipeline progress UI, checkpoint cards, output/download page
- **Python FastAPI backend** (separate Railway deployment) — LangGraph pipeline, Tavily research workers, GPT-4.1 synthesis, PostgreSQL checkpointer

**Why two services:** LangGraph requires a persistent, long-running process for state across `interrupt()` calls. Vercel functions time out at 60 seconds — research runs routinely exceed that. Railway solves it cleanly.

## Stack Additions

### Frontend (Next.js)

- No additional npm packages required. Uses existing fetch/polling pattern against FastAPI endpoints.

### Backend (Python / Railway)

- `langgraph` — workflow orchestration + `interrupt()` for human-in-the-loop checkpoints
- `langgraph-checkpoint-postgres` — PostgreSQL checkpointer (Neon free tier, persists state across Railway restarts)
- `fastapi` + `uvicorn` — API server
- `tavily-python` — `TavilySearchResults` tool for agentic web research (Reddit, Product Hunt, Indie Hackers). Free: 1,000 calls/mo. Paid: $0.008/call. (env var: `TAVILY_API_KEY`)
- `openai` — GPT-4.1 for synthesis, gap analysis, and doc generation. Use `gpt-4.1` only. (env var: `OPENAI_API_KEY`)
- `psycopg` — PostgreSQL driver for Neon checkpointer (env var: `NEON_DATABASE_URL`)

### Environment Variables (Backend)

- `OPENAI_API_KEY`
- `TAVILY_API_KEY`
- `NEON_DATABASE_URL` — Neon PostgreSQL connection string
- `ALLOWED_ORIGINS` — comma-separated list of allowed CORS origins (e.g. `https://modrynstudio.com,http://localhost:3000`)

### Environment Variables (Frontend)

- `NEXT_PUBLIC_GROUNDWORK_API_URL` — base URL of the Railway FastAPI deployment

## Route Map

### Frontend (Next.js)

- `/tools/groundwork` → Idea backlog: persistent textarea for dumping ideas (one or many). Voice input supported. "Run pipeline" button triggers Stage 0. Submits all ideas to FastAPI, stores `thread_id`, begins polling.
- `/tools/groundwork/run/[threadId]` → Pipeline progress + checkpoint UI. Polls `GET /pipeline/status/:threadId` every 2s. Renders checkpoint cards when interrupted. Shows completion state with download buttons. Pipeline error state is handled inline on this route — no separate error page.

### Backend (FastAPI)

- `POST /pipeline/start` → Accepts `{ ideas: string[] }`. Validates input (at least 1 idea), creates LangGraph thread, begins async execution. Returns `{ thread_id }`.
- `GET /pipeline/status/:thread_id` → Returns `{ state: "running" | "interrupted" | "complete" | "error", stage?: string, interrupt?: { question: string, context: string } }`.
- `POST /pipeline/resume/:thread_id` → Sends user decision to LangGraph via `Command(resume=...)`. Returns `{ state }`.
- `GET /pipeline/result/:thread_id` → Returns `{ context_md: string, brand_md: string }` when complete.

## API Route Convention (Frontend)

Every route in `/app/api/` MUST use `createRouteLogger` from `@/lib/route-logger`. No raw `console.log` in routes.

```ts
import { createRouteLogger } from '@/lib/route-logger';
const log = createRouteLogger('groundwork-proxy');

export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();
  try {
    // handler body
    return log.end(ctx, Response.json(result));
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## LangGraph Pipeline: Stage-by-Stage

### Stage 0 — Market Identification (no human gate)

GPT-4.1 receives all ideas from the builder's dump and:

- Clusters them by implied market/domain
- Identifies 2–3 distinct market areas the ideas point to
- Writes a one-line description of each cluster and which ideas belong to it

### Checkpoint 0 — Market Selection

`interrupt()` surfaces the market clusters. Question: "Here are the markets your ideas point to. Which one do you want to run the pipeline on?" Builder picks one. This becomes the market input for all downstream research. If only one clear cluster exists, it's surfaced as a confirmation rather than a choice.

### Stage 1 — Parallel Research (no human gate)

Four worker agents run simultaneously via LangGraph parallelization using the selected market:

- **Reddit agent:** Tavily search for "[market] people pay for", "[market] worth it reddit", "[market] alternatives reddit". Extracts: what people pay, price points, top complaints.
- **Product Hunt agent:** Tavily search for "[market] site:producthunt.com". Extracts: top products, upvotes, pricing, common criticism in comments.
- **Indie Hackers agent:** Tavily search for "[market] site:indiehackers.com". Extracts: what's working for builders, revenue ranges, gaps mentioned.
- **GitHub agent:** Tavily search for "[market] site:github.com stars". Extracts: high-star repos in the market, what problems they solve, open issues and complaints, what people fork/extend. For developer tool markets, a 10k-star repo with no commercial wrapper is the same signal as a paid competitor — proven demand, unmonetized gap.

### Stage 2 — Synthesis (no human gate)

GPT-4.1 receives all three research dumps and produces:

- **What's already selling:** Competitive landscape table (name, price, what it does, why people pay for it, top complaint). The primary output is the "copy" layer — what has proven demand.
- **3 differentiation angles** — not formal "gaps." These are opinionated takes on where to put your signature on what already sells. Format: `Angle: [one-line description]. Evidence: [source + quote]. Signature play: [what makes it distinct]`

### Checkpoint 1 — Differentiation Decision

`interrupt()` surfaces the 3 angles to the user. Question: "Here's what's already selling and why people pay for it. Which angle do you want to make yours? Pick one, or describe your own." User picks or types. This becomes the positioning anchor for all downstream doc generation. This is the "add your signature" moment — the one decision only the builder can make.

### Stage 3 — Draft context.md (no human gate)

GPT-4.1 fills the following context.md sections from research + gap selection:

- Product (name TBD — inferred from the builder's ideas and selected market)
- Target User
- Competitive Landscape
- Market Validation (pulls cited sources from Stage 1 research)

Sections left blank for user: Deployment, Minimum Money Loop, Stack Additions, Route Map, Monetization, Target Subreddits.

### Checkpoint 2 — Context Review

`interrupt()` surfaces the draft context.md. Question: "Does this match your intent? Push back on anything — persona, positioning, competitor framing." User edits inline or types corrections. GPT-4.1 applies changes and regenerates.

### Stage 4 — Brand Synthesis (no human gate)

GPT-4.1 derives brand.md from:

- The chosen gap and positioning angle
- The competitive landscape (what visual/voice territory competitors own, what to avoid)
- The target user persona
  Fills all brand.md sections: Voice, The User, Visual Rules, Color System, Logomark, Emotional Arc, Copy Examples, Launch Voice.

### Checkpoint 3 — Brand Review

`interrupt()` surfaces the draft brand.md. Question: "Does the voice feel right? Does the color system make sense for this market?" User confirms or adjusts. Final brand.md written.

### Stage 5 — Finalize

Both docs marked complete. Thread state set to `"complete"`. Result available at `GET /pipeline/result/:thread_id`.

## Checkpointer

Use `PostgresSaver` from `langgraph-checkpoint-postgres` with Neon free tier. Required because Railway processes restart on deploy — `InMemorySaver` would lose all thread state. `thread_id` is a UUID generated at pipeline start, stored in Next.js state and the URL (`/tools/groundwork/run/[threadId]`).

## Architecture Constraints

- **No user accounts.** `thread_id` is the session identifier. If the user closes the browser and returns to the same URL, the pipeline resumes from the last checkpoint.
- **No storing of user inputs or generated docs server-side beyond pipeline completion.** After the user downloads both files, thread data can be considered ephemeral. Do not build a history feature.
- **CORS:** FastAPI must restrict `allow_origins` to Modryn Studio's domain + localhost in dev. No open CORS.
- **No streaming in V1.** Pipeline returns atomic states (running/interrupted/complete). Streaming partial output adds complexity without meaningful UX benefit at this stage.
- **LangGraph graph recompiles on process start.** Define the graph at module level in FastAPI, not inside the request handler.

## Market Validation

Researched March 2026. Demand confirmed before building.

- **AI Cofounder (formerly Buildpad):** 40,000+ founders, $20/mo Pro. Top Product Hunt criticism: _"Just threw links at me. No real synthesis, no proper validation."_ They confirmed in their response they use automated keyword search, not deep synthesis. No structured output.
- **Gap confirmed:** No tool produces machine-readable `context.md` + `brand.md` output. No tool forces a specific positioning decision through a structured decision gate. No tool is designed for the builder who already knows how to code.
- **The Marc Lou framing (March 2026):** "Stop looking for startup ideas. 1. Find a market you care about. 2. Copy a product people already pay for. 3. Add your signature to make it yours." Groundwork operationalizes this exactly. Builder names the market (step 1). Agents find what's already selling (step 2). Checkpoint 1 is the differentiation decision — the one call only the builder can make (step 3). The output docs are step 4.

## Competitive Landscape

- **AI Cofounder / Buildpad:** $20–80/mo. Chat-style guided interview. Outputs conversational summaries, not structured docs. Research layer has improved (parallel agents, cited reports) but output is still prose — not machine-readable build files. No positioning decision gate. No project scaffold output.
- **Prelaunch.com:** Deposit-based willingness-to-pay testing. Wrong market (physical products, consumer goods). Requires media budget. Not for solo software builders.
- **DIY ChatGPT approach:** Free but manual. No pipeline structure, no parallel research, no output schema. Builder has to know the right questions to ask and then format the output themselves.
- **Groundwork's wedge:** Outputs the exact artifacts the builder needs to start — not a report to read, not a chat to screenshot. The research is already synthesized. The decisions are already named. Open the files, drop them in, run `/setup`.

## Output Schema

Both output documents must match the exact structure of the templates below. Do not add or remove sections. GPT-4.1 should be given the full template with empty sections as a few-shot target.

### context.md sections (in order)

Core Framework · Product · Target User · Deployment · Minimum Money Loop · Stack Additions · Project Structure Additions · Route Map · API Route Convention · Monetization · Target Subreddits · Architecture Constraints · Market Validation · Competitive Landscape · Output Structure (if applicable)

### brand.md sections (in order)

Voice · The User · Visual Rules · Color System · Logomark · Emotional Arc · Copy Examples · Launch Voice (Reddit)

Template files: `projects/tradebrief/context.md` and `projects/tradebrief/brand.md` — use these as the few-shot examples for GPT-4.1 doc generation prompts.

## V2: GitHub Automation

After V1 is validated (3+ runs with quality output), add:

- `POST /pipeline/result/:thread_id/push-to-github` → creates a new repo from `modryn-studio/nextjs_boilerplate` template, commits `context.md` + `brand.md`. Requires user GitHub OAuth token.
- Frontend: "Push to GitHub" button on the result page, shown after download.

Do not build V2 until output doc quality is stable across multiple real runs.

## Launch Strategy

Luke uses it first. Three runs minimum before anyone else sees it. Evaluate: how much editing do the output docs need vs. the TradeBrief docs we produced manually? If it's under 20 minutes of refinement, the pipeline is validated.

After validation: post in Indie Hackers and Ship or Die first (builders, not traders). The Reddit angle here is r/SideProject or r/EntrepreneurRideAlong. Post angle: "I was spending hours on market research before every build. I automated the part that isn't creative."

**Log post hook:** "The research phase shouldn't take half a day. I built a pipeline that does it for me."

**Log post intellectual frame (context engineering angle):**
There's a term gaining traction right now — context engineering. The idea that agent failures aren't model failures, they're context failures. Groundwork is a pipeline that engineers the context before the build session begins. `context.md` and `brand.md` aren't outputs — they're the context window for the first Copilot session. The pipeline's job is to fill that window correctly before a single line of code is written.
Coined/amplified mid-2025: Tobi Lutke (Shopify CEO) → Andrej Karpathy → Simon Willison called it likely to stick. Use in the log post as the intellectual frame, not in product copy.

## Build Sequence

**You are the pipeline first. Build the tool to replace what you're doing, one step at a time, in the order you do it.**

This is not a normal boilerplate clone-and-scaffold project. The pipeline behavior has to be discovered through manual runs before any automation is written. Do not let the scaffolding lead — infrastructure follows experience.

### Correct order

1. ~~**Clone + `/setup`**~~ ✅ Done. Repo live, deploys clean.
2. ~~**Run the framework manually**~~ ✅ Done. Groundwork itself was the manual run — market research, competitive analysis, differentiation decision all done by hand before a line of pipeline code was written.
3. ~~**Document what you actually did**~~ ✅ Done. `docs/backend-reference.md` captures the query patterns, API shapes, and patterns from reference repos. `context.md` Stage 1 section documents what each research worker extracts.
4. ~~**Build the intake**~~ ✅ Done. `/start` — idea dump + four market discovery modes (Browse, Type it, Competitor, Subreddit) → unified `MarketSignal`. Market signal wiring to pipeline is stubbed, ready to connect.
5. **Build the Python backend** — FastAPI + LangGraph. Start with Stage 0 (market identification from ideas) and the first `interrupt()`. Get one checkpoint working end-to-end before building Stage 1 research workers. Reference: `docs/backend-reference.md`.
6. **Build Stage 1 research workers** — four parallel Tavily agents (Reddit, Product Hunt, Indie Hackers, GitHub). Wire to the checkpoint. Confirm output quality before building synthesis.
7. **Continue one stage at a time** — synthesis, doc generation, each checkpoint. Run each stage against a real market before building the next.

### The rule

Don't write pipeline code for a stage you haven't run manually at least once. The manual run is the spec. If the manual run is hard to describe, the stage isn't ready to build yet.

### Stopping point after `/setup`

`/setup` sets up config and copy — site.ts, copilot-instructions.md, globals.css. It does not generate feature code. That's the correct stopping point before beginning the manual research phase. Do not prompt for routes, components, or API handlers until Stage 1 behavior is confirmed from manual runs.

---

## LLM Cost

GPT-4.1: $2.00/1M input, $8.00/1M output. Full pipeline (3 Tavily research dumps + synthesis + 2 doc drafts + revisions) estimated 20,000–40,000 tokens total. Cost per run: ~$0.10–0.20. Acceptable at any reasonable price point.

## Monetization

- V1: `email-only` — no paygate. Invite-only / unlisted while Luke validates output quality.
- Post-validation: `one-time-payment` — likely $9/3 runs or monthly flat. Add after 3+ real runs produce output within 20 minutes of manual editing.

## Target Subreddits

- r/EntrepreneurRideAlong
- r/webdev

## Social Profiles

- X/Twitter: https://x.com/lukehanner
- GitHub: https://github.com/TODO
- Dev.to: https://dev.to/lukehanner
- Ship or Die: https://shipordie.club/lukehanner
