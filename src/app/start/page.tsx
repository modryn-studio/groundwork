'use client';

import { useState, useEffect } from 'react';
import { markets, type MarketSignal } from '@/config/markets';
import { MarketGrid } from '@/components/market-grid';
import { MarketModeTabs, type MarketMode } from '@/components/market-mode-tabs';
import { MarketTextInput } from '@/components/market-text-input';
import { IdeaDump, type DumpedIdea } from '@/components/idea-dump';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type View = 'dump' | 'market';

export default function StartPage() {
  const [view, setView] = useState<View>('dump');
  const [marketSignal, setMarketSignal] = useState<MarketSignal | null>(null);
  const [marketMode, setMarketMode] = useState<MarketMode>('category');
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

  const handleModeChange = (mode: MarketMode) => {
    setMarketMode(mode);
    setMarketSignal(null);
  };

  // Derive the Market object the grid needs to show a checkmark
  const selectedMarketForGrid =
    marketSignal?.type === 'category'
      ? (markets.find((m) => m.id === marketSignal.value) ?? null)
      : null;

  // TODO: wire this into ideas[] when pipeline is live
  // const formatSignal = (s: MarketSignal) => ({
  //   category:   `market category: ${s.label}`,
  //   freetext:   `my market: ${s.value}`,
  //   competitor: `my competitor: ${s.value}`,
  //   subreddit:  `my community: r/${s.value}`,
  // }[s.type]);

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
          <MarketModeTabs mode={marketMode} onModeChange={handleModeChange} />
          {marketMode === 'category' && (
            <MarketGrid
              markets={markets}
              selected={selectedMarketForGrid}
              onSelect={(m) =>
                setMarketSignal(
                  marketSignal?.value === m.id
                    ? null
                    : { type: 'category', value: m.id, label: m.name }
                )
              }
            />
          )}
          {marketMode === 'freetext' && (
            <MarketTextInput
              placeholder="freelance video editors"
              onSubmit={(v) => setMarketSignal({ type: 'freetext', value: v, label: v })}
            />
          )}
          {marketMode === 'competitor' && (
            <MarketTextInput
              placeholder="Notion"
              onSubmit={(v) => setMarketSignal({ type: 'competitor', value: v, label: v })}
            />
          )}
          {marketMode === 'subreddit' && (
            <MarketTextInput
              placeholder="personalfinance"
              prefix="r/"
              onSubmit={(v) =>
                setMarketSignal({ type: 'subreddit', value: v, label: `r/${v}` })
              }
            />
          )}
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
            className="text-muted hover:text-text px-0 py-0 text-sm"
          >
            pick a market →
          </Button>
        </div>
      )}

      {/* Sticky CTA — appears when market signal set */}
      <div
        className={cn(
          'border-border bg-bg fixed inset-x-0 border-t transition-transform duration-200',
          marketSignal ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ bottom: keyboardOffset }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-col">
            <span className="text-muted text-[11px] tracking-widest uppercase">Market</span>
            <span className="font-heading text-text text-sm font-semibold">
              {marketSignal?.label}
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
