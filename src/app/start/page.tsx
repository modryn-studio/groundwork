'use client';

import { useState, useEffect } from 'react';
import { markets, type Market } from '@/config/markets';
import { MarketGrid } from '@/components/market-grid';
import { IdeaDump, type DumpedIdea } from '@/components/idea-dump';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type View = 'dump' | 'market';

export default function StartPage() {
  const [view, setView] = useState<View>('dump');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [ideas, setIdeas] = useState<DumpedIdea[]>([]);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vp = window.visualViewport;
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vp.height - vp.offsetTop);
      setKeyboardOffset(offset > 120 ? offset : 0);
    };
    update();
    vp.addEventListener('resize', update);
    vp.addEventListener('scroll', update);
    return () => {
      vp.removeEventListener('resize', update);
      vp.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <main className="bg-bg min-h-screen">
      {view === 'dump' ? (
        /* Dump view — screen = textarea, vertically centered */
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md">
            <IdeaDump naked autoFocus onIdeasChange={setIdeas} />
          </div>
        </div>
      ) : (
        /* Market view */
        <div className="mx-auto max-w-3xl px-4 pt-12 pb-32 sm:px-6">
          <Button
            variant="ghost"
            onClick={() => setView('dump')}
            className="text-muted hover:text-text mb-8 px-0 py-0 text-sm"
          >
            ← dump
          </Button>
          <MarketGrid
            markets={markets}
            selected={selectedMarket}
            onSelect={(m) => setSelectedMarket(selectedMarket?.id === m.id ? null : m)}
          />
        </div>
      )}

      {/* Fixed bottom-right nav — dump view only */}
      {view === 'dump' && (
        <div
          className="fixed right-6 transition-all"
          style={{ bottom: keyboardOffset > 0 ? keyboardOffset + 24 : 24 }}
        >
          <Button
            variant="ghost"
            onClick={() => setView('market')}
            className="text-muted hover:text-text px-0 py-0 text-xs"
          >
            pick a market →
          </Button>
        </div>
      )}

      {/* Sticky CTA — appears when market selected */}
      <div
        className={cn(
          'border-border bg-bg fixed inset-x-0 border-t transition-transform duration-200',
          selectedMarket ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ bottom: keyboardOffset }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-col">
            <span className="text-muted text-[11px] tracking-widest uppercase">Market</span>
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
