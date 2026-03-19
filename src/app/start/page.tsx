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
    <main className="bg-bg min-h-screen px-4 pt-16 pb-32 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-text text-2xl font-bold sm:text-3xl">Pick a market.</h1>
          <p className="text-muted mt-2 text-[15px]">
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
          <p className="text-muted mb-4 text-[13px] tracking-widest uppercase">
            Not sure which market? Dump your ideas.
          </p>
          <IdeaDump onIdeasChange={setIdeas} />
          {ideas.length > 0 && !selectedMarket && (
            <p className="text-muted mt-4 text-[13px]">
              Pick a market above — or run the pipeline and let it find one from your ideas.
            </p>
          )}
        </div>
      </div>

      {/* Sticky CTA — always visible once market is selected */}
      <div
        className={cn(
          'border-border bg-bg fixed inset-x-0 bottom-0 border-t transition-transform duration-200',
          selectedMarket ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-col">
            <span className="text-muted text-[11px] tracking-widest uppercase">Selected</span>
            <span className="font-heading text-text text-sm font-semibold">
              {selectedMarket?.name}
            </span>
          </div>
          <Button type="button" disabled title="Pipeline coming soon" className="rounded-none px-6">
            Run pipeline →
          </Button>
        </div>
      </div>
    </main>
  );
}
