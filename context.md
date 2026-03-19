# Project Context

## Product

Groundwork — idea-to-spec pipeline for solo builders. Drop a market and a rough idea. Agents research what people already pay for, surface the competitive gap, guide you through 3 decisions. You get a completed `context.md` + `brand.md`, ready to drop into the boilerplate and run `/setup`.

## Core Framework

**The mental model Groundwork operationalizes:**

1. Find a market you care about
2. Copy a product people already pay for
3. Add your signature to make it yours

In pipeline terms: **market you know → find what people pay for → differentiation decision → docs**

Operationally: **you name the market → agents find what's already selling → you decide the angle**

The builder supplies step 1. The agents execute step 2. The human checkpoints force step 3. The output is step 4 — the actual files to build from.

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

- `/tools/groundwork` → Input form: market (text) + rough idea (text). Submits to FastAPI, stores `thread_id`, begins polling.
- `/tools/groundwork/run/[threadId]` → Pipeline progress + checkpoint UI. Polls `GET /pipeline/status/:threadId` every 2s. Renders checkpoint cards when interrupted. Shows completion state with download buttons. Pipeline error state is handled inline on this route — no separate error page.

### Backend (FastAPI)

- `POST /pipeline/start` → Validates input, creates LangGraph thread, begins async execution. Returns `{ thread_id }`.
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

### Stage 1 — Parallel Research (no human gate)

Three worker agents run simultaneously via LangGraph parallelization:

- **Reddit agent:** Tavily search for "[market] people pay for", "[market] worth it reddit", "[market] alternatives reddit". Extracts: what people pay, price points, top complaints.
- **Product Hunt agent:** Tavily search for "[market] site:producthunt.com". Extracts: top products, upvotes, pricing, common criticism in comments.
- **Indie Hackers agent:** Tavily search for "[market] site:indiehackers.com". Extracts: what's working for builders, revenue ranges, gaps mentioned.

### Stage 2 — Synthesis (no human gate)

GPT-4.1 receives all three research dumps and produces:

- **What's already selling:** Competitive landscape table (name, price, what it does, why people pay for it, top complaint). The primary output is the "copy" layer — what has proven demand.
- **3 differentiation angles** — not formal "gaps." These are opinionated takes on where to put your signature on what already sells. Format: `Angle: [one-line description]. Evidence: [source + quote]. Signature play: [what makes it distinct]`

### Checkpoint 1 — Differentiation Decision

`interrupt()` surfaces the 3 angles to the user. Question: "Here's what's already selling and why people pay for it. Which angle do you want to make yours? Pick one, or describe your own." User picks or types. This becomes the positioning anchor for all downstream doc generation. This is the "add your signature" moment — the one decision only the builder can make.

### Stage 3 — Draft context.md (no human gate)

GPT-4.1 fills the following context.md sections from research + gap selection:

- Product (name TBD — use the user's rough idea as the name for now)
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

1. **Clone + `/setup`** — get the repo and scaffolding out of the way. It deploys. It builds. Stop there.
2. **Run the framework manually** — use Claude or ChatGPT. Pick a real market you care about. Find what people actually pay for (Product Hunt, Reddit, IH — manually, no scripts). Make the differentiation call. Write it down.
3. **Document what you actually did** — what queries did you run? What did you find? How long did each step take? What was hard to synthesize? This becomes the real spec for Stage 1.
4. **Build step 1** — the intake form — because you now know exactly what inputs are needed.
5. **Build Stage 1** — the research agents — because you know what queries work, because you just ran them yourself.
6. **Continue one stage at a time**, always running the stage manually before automating it.

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
