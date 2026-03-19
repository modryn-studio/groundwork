'use client';

import { useState } from 'react';
import { markets, type Market } from '@/config/markets';
import { MarketGrid } from '@/components/market-grid';
import { IdeaDump, type DumpedIdea } from '@/components/idea-dump';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function StartPage() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [ideas, setIdeas] = useState<DumpedIdea[]>([]);

  return (
    <main className="min-h-screen bg-bg px-4 pb-32 pt-16 sm:px-6">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-2xl font-bold text-text sm:text-3xl">
            Pick a market.
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            Choose one you care about. That&apos;s step one.
          </p>
        </div>

        {/* Market grid */}
        <MarketGrid
          markets={markets}
          selected={selectedMarket}
          onSelect={(m) => setSelectedMarket(selectedMarket?.id === m.id ? null : m)}
        />

        {/* Idea dump */}
        <div className="mt-14">
          <p className="mb-4 text-[13px] uppercase tracking-widest text-muted">
            Not sure which market? Dump your ideas.
          </p>
          <IdeaDump onIdeasChange={setIdeas} />
          {ideas.length > 0 && !selectedMarket && (
            <p className="mt-4 text-[13px] text-muted">
              Pick a market above — or run the pipeline and let it find one from your ideas.
            </p>
          )}
        </div>
      </div>

      {/* Sticky CTA — always visible once market is selected */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 border-t border-border bg-bg transition-transform duration-200',
          selectedMarket ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-widest text-muted">Selected</span>
            <span className="font-heading text-sm font-semibold text-text">
              {selectedMarket?.name}
            </span>
          </div>
          <Button
            type="button"
            disabled
            title="Pipeline coming soon"
            className="rounded-none px-6"
          >
            Run pipeline →
          </Button>
        </div>
      </div>
    </main>
  );
}
