'use client';

import { cn } from '@/lib/cn';
import { type Market, type MarketTag } from '@/config/markets';
import { Check } from 'lucide-react';

const tagStyles: Record<MarketTag, string> = {
  popular: 'text-accent border-accent/40',
  'weak-competition': 'text-secondary border-secondary/40',
  emerging: 'text-muted border-muted/40',
};

const tagLabels: Record<MarketTag, string> = {
  popular: 'popular',
  'weak-competition': 'weak competition',
  emerging: 'emerging',
};

interface MarketGridProps {
  markets: Market[];
  selected: Market | null;
  onSelect: (market: Market) => void;
}

export function MarketGrid({ markets, selected, onSelect }: MarketGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {markets.map((market) => {
        const isSelected = selected?.id === market.id;
        return (
          <button
            key={market.id}
            type="button"
            onClick={() => onSelect(market)}
            className={cn(
              'relative flex flex-col gap-2 rounded-none border p-4 text-left transition-colors',
              'min-h-[100px] cursor-pointer',
              isSelected
                ? 'border-accent bg-accent/5'
                : 'border-border bg-surface hover:border-accent/50',
            )}
          >
            {isSelected && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                <Check size={12} className="text-white" strokeWidth={3} />
              </span>
            )}
            <span className="font-heading text-sm font-semibold text-text">{market.name}</span>
            <span className="text-[13px] leading-relaxed text-muted">{market.description}</span>
            {market.tags.length > 0 && (
              <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                {market.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn('border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide', tagStyles[tag])}
                  >
                    {tagLabels[tag]}
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
