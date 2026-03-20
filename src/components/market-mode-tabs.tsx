'use client';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';

export type MarketMode = 'category' | 'freetext' | 'competitor' | 'subreddit';

const MODES: { id: MarketMode; label: string }[] = [
  { id: 'category', label: 'Browse' },
  { id: 'freetext', label: 'Type it' },
  { id: 'competitor', label: 'Competitor' },
  { id: 'subreddit', label: 'Subreddit' },
];

interface MarketModeTabsProps {
  mode: MarketMode;
  onModeChange: (mode: MarketMode) => void;
}

export function MarketModeTabs({ mode, onModeChange }: MarketModeTabsProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {MODES.map(({ id, label }) => (
        <Button
          key={id}
          type="button"
          variant="ghost"
          onClick={() => onModeChange(id)}
          className={cn(
            'rounded-none border px-3 py-1 text-sm',
            mode === id
              ? 'border-accent text-accent'
              : 'border-border text-muted hover:border-accent/50 hover:text-text'
          )}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
