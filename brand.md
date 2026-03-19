# Brand

Fill this in before running `/setup`. It populates the Brand & Voice section of `copilot-instructions.md`.

---

## Voice

- Short sentences. Builders skim. Get to the point.
- Talk to someone who has started and abandoned too many side projects in the research phase.
- You already know how to build. This clears the runway.
- Never use: "powerful", "seamless", "AI-powered", "unlock", "revolutionize", "validate", "supercharge"

---

## The User

A solo builder who has an idea (or a market they already care about) and wants to start building — not spend a week on market research, competitive analysis, and positioning before touching code. They've done this the hard way before. They know the research is necessary. They just don't want to do it manually again.

**Core positioning:** Groundwork doesn't replace your judgment. It does the research and names the decisions so you can make them fast. The output isn't a report — it's the exact files you need to start building. You supply the idea. Groundwork does the legwork.

---

## Visual Rules

- Color mode: Dark only — this is a builder tool, not a SaaS landing page
- Fonts: Space Grotesk (headings) + Space Mono (pipeline output, doc previews, file names)
- Motion: Minimal — one subtle progress indicator during pipeline runs only. Nothing decorative.
- Avoid: No rocket ships, no lightbulbs, no "idea" stock imagery, no generic startup visual vocabulary

---

## Color System

Seven named slots — these become the `@theme` tokens in `globals.css`.

| Name       | Hex     | Role                                                     |
| ---------- | ------- | -------------------------------------------------------- |
| Accent     | #F97415 | Amber — action, progress, CTAs. Matches Modryn Studio.   |
| Secondary  | #3B82F6 | Blue — checkpoint cards, decision prompts, informational |
| Background | #0d0d0d | Dark gray — not pure black. Gives surfaces room to breathe. |
| Text       | #E5E5E5 | Off-white — readable on dark                             |
| Muted      | #666666 | Placeholders, labels, secondary text. Readable on dark bg. |
| Surface    | #161616 | Panel and card backgrounds. Subtle lift from base.       |
| Border     | #222222 | Separators, card outlines. Visible but not loud.         |

Color rules:

- Accent amber is inherited from Modryn Studio — this tool lives in the studio, it should feel like part of the same system. Use it sparingly: CTAs, progress indicators, selected states. The less often it appears, the more it means.
- Secondary blue is reserved for checkpoint / decision UI only. When the pipeline pauses and asks a question, the card turns blue. Amber = forward motion, blue = your turn.
- The base layer (bg, surface, border, muted) is intentionally achromatic — grays only. Color only appears when it signals something: action (amber) or handoff (blue).
- Never use red except for error states.

---

## Logomark

**Direction:** "G" letterform in Space Mono, or abstract horizontal layers suggesting stacked groundwork / foundation layers

**Primary color:** Accent #F97415

**Background:** Transparent — no container

**Future-proofing:** Mark must work as a standalone icon in the tools grid on modrynstudio.com. Keep it simple enough to read at 40×40px.

**Competitor exclusions:** AI Cofounder uses a chat-bubble / conversation icon. Avoid anything that reads as "chat" or "conversation."

**Anti-patterns:** No lightbulbs, no gears, no brain icons — the entire "idea + AI" visual vocabulary is off-limits.

---

## Emotional Arc

What a visitor feels at each stage — land, read, scroll, convert.

- Land: "This is the thing I've been doing manually in a conversation with ChatGPT"
- Read: "It actually outputs the files I need, not a summary to screenshot"
- Scroll: "I want to see what the checkpoint looks like"
- Convert: "I have an idea right now. I'm running it."

---

## Copy Examples

Real copy to use as reference when writing UI text.

- Hero: "Drop an idea. Get the docs."
- Sub: "You name the market. Agents find what's already selling. You decide the angle. You get context.md and brand.md, ready to build from."
- CTA: "Start the pipeline"
- Stage label (running): "Researching what people pay for..."
- Stage label (checkpoint): "Your turn."
- Checkpoint prompt: "Here's what the research found. Pick the gap you want to own."
- Empty state: "Enter a market and a rough idea to start."
- Completion: "Your docs are ready. Drop them in the boilerplate and run /setup."
- Against AI Cofounder: "Doesn't give you a report. Gives you the files."
- Against DIY ChatGPT: "You've done this in a chat window before. You know how it ends."
- Footer: "Built by a builder who got tired of doing research before the research."

---

## Launch Voice (Indie Hackers / Ship or Die)

The launch post is not marketing. It's a builder talking to other builders. Tone rules:

- First person, past tense problem statement. "I was spending hours on research before every build..."
- Name the product early. Link to the tool page.
- Describe the output concretely — "two markdown files, context.md and brand.md." Specificity signals it's real.
- No AI hype. "Agents do the research, you make the decisions" — not "AI-powered market validation."
- The product does the legwork. You make the calls. Say that plainly.
