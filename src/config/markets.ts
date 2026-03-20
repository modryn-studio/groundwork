export type MarketTag = 'popular' | 'weak-competition' | 'emerging';

export interface Market {
  id: string;
  name: string;
  description: string;
  tags: MarketTag[];
}

export type MarketSignalType = 'category' | 'freetext' | 'competitor' | 'subreddit';

export interface MarketSignal {
  type: MarketSignalType;
  /** Raw value — market id, typed text, competitor name, or subreddit slug */
  value: string;
  /** Display string for the CTA bar */
  label: string;
}

// Tags are applied based on research, not optimism.
// popular         = established paid products with real user bases exist
// weak-competition = no dominant tool serving the solo builder niche specifically
// emerging        = category growing but no clear winner yet
export const markets: Market[] = [
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    description: 'CLIs, IDE extensions, code review, local dev, debugging utilities.',
    tags: ['popular'],
  },
  {
    id: 'ai-utilities',
    name: 'AI Utilities',
    description: 'Wrappers, prompt tooling, LLM integrations, context management.',
    tags: ['popular', 'weak-competition'],
  },
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Task management, note-taking, focus tools, personal dashboards.',
    tags: ['popular'],
  },
  {
    id: 'creator-tools',
    name: 'Creator Tools',
    description: 'Content scheduling, analytics, link-in-bio, newsletter tooling.',
    tags: ['popular', 'weak-competition'],
  },
  {
    id: 'maker-tools',
    name: 'Maker Tools',
    description: 'Prototyping, hardware integration, IoT dashboards, DIY workflows.',
    tags: ['weak-competition'],
  },
  {
    id: 'health-fitness',
    name: 'Health & Fitness',
    description: 'Habit tracking, workout logging, nutrition, sleep, recovery.',
    tags: ['popular'],
  },
  {
    id: 'fintech',
    name: 'Fintech',
    description: 'Expense tracking, budgeting, invoicing, freelancer finance tools.',
    tags: ['popular', 'weak-competition'],
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Flashcard systems, course tools, quiz builders, learning trackers.',
    tags: ['popular'],
  },
  {
    id: 'job-search',
    name: 'Job Search',
    description: 'Resume tools, application tracking, interview prep, LinkedIn utilities.',
    tags: ['weak-competition', 'emerging'],
  },
  {
    id: 'e-commerce',
    name: 'E-commerce',
    description: 'Store tooling, inventory management, product listing, pricing tools.',
    tags: ['popular'],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Lightweight analytics, event tracking, dashboards, reporting.',
    tags: ['popular', 'weak-competition'],
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Team chat, async video, status pages, notification tooling.',
    tags: ['popular'],
  },
  {
    id: 'local-services',
    name: 'Local Services',
    description: 'Booking, scheduling, client management for local businesses.',
    tags: ['weak-competition', 'emerging'],
  },
];
