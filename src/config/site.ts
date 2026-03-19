// Single source of truth for all site-wide metadata.
// /init fills this in from context.md + brand.md.
// Every other file imports from here — never hardcode site metadata elsewhere.
export const site = {
  name: 'Groundwork',
  shortName: 'Groundwork',
  url: 'https://modrynstudio.com/tools/groundwork',
  // Base description — used in <meta description>, manifest, JSON-LD
  description:
    'Dump your ideas. Groundwork identifies the market, researches what people pay for, and outputs context.md + brand.md — ready to build from.',
  // Used as the <title> tag (homepage + fallback) AND social card title.
  ogTitle: 'Groundwork — The Research Pipeline for Solo Builders',
  ogDescription:
    'Dump your ideas. Agents find the market and what people already pay for. You decide the angle. You get context.md and brand.md, ready to build from.',
  cta: 'Start the pipeline →',
  founder: 'Luke Hanner',
  email: 'hello@modrynstudio.com',
  // Waitlist section copy — shown in the EmailSignup component on the landing page.
  waitlist: {
    headline: 'Get early access.',
    subheadline:
      "Groundwork is invite-only while I validate output quality. Drop your email and I'll reach out when it's ready to run.",
    success: "Got it. You'll hear from me when it's ready.",
  },
  // Brand colors — used in manifest theme_color / background_color
  accent: '#F97415',
  bg: '#0d0d0d',
  // Social profiles
  social: {
    twitter: 'https://x.com/lukehanner',
    twitterHandle: '@lukehanner',
    github: 'https://github.com/modryn-studio/groundwork',
    devto: 'https://dev.to/lukehanner',
    shipordie: 'https://shipordie.club/lukehanner',
  },
} as const;
