'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

interface MarketOption {
  label: string;
  description: string;
  ideas: string[];
}

interface CheckpointInterrupt {
  type: 'checkpoint';
  stage: string;
  question: string;
  options: MarketOption[];
}

interface PipelineResult {
  market_confirmed: boolean;
  market: string;
}

interface PipelineStatus {
  state: 'pending' | 'running' | 'interrupted' | 'complete' | 'failed';
  stage: string | null;
  interrupt: CheckpointInterrupt | null;
  result: PipelineResult | null;
}

export default function RunContent({ threadId }: { threadId: string }) {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status?.state === 'complete' || status?.state === 'failed') return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/pipeline/status/${threadId}`);
        if (!res.ok) return;
        const data: PipelineStatus = await res.json();
        setStatus(data);
      } catch {
        // network blip — keep polling
      }
    };

    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [threadId, status?.state]);

  const handleLockIn = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/pipeline/resume/${threadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: { chosen_market: selected } }),
      });
      if (!res.ok) throw new Error('resume failed');
      setStatus((s) => (s ? { ...s, state: 'running', interrupt: null } : s));
    } catch {
      setError('Something went wrong. Refresh and try again.');
      setSubmitting(false);
    }
  };

  if (status?.state === 'failed') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-muted text-sm">Pipeline failed. Go back and try again.</p>
      </div>
    );
  }

  if (status?.state === 'complete' && status.result) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm space-y-2 text-center">
          <p className="font-heading text-accent text-lg font-semibold">Market locked.</p>
          <p className="font-heading text-text font-medium">{status.result.market}</p>
          <p className="text-muted text-sm">Research coming soon.</p>
        </div>
      </div>
    );
  }

  if (status?.state === 'interrupted' && status.interrupt?.stage === 'market_selection') {
    const { options } = status.interrupt;
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <p className="font-heading text-secondary mb-8 text-2xl font-semibold">Your turn.</p>
        <div className="space-y-3">
          {options.map((opt) => (
            /* Intentionally raw button — selectable card pattern, not a standard CTA */
            <button
              key={opt.label}
              type="button"
              onClick={() => setSelected(opt.label)}
              className={cn(
                'border-border bg-surface w-full border p-4 text-left transition-colors',
                selected === opt.label ? 'border-secondary' : 'hover:border-muted'
              )}
            >
              <p className="font-heading text-text text-sm font-semibold">{opt.label}</p>
              <p className="text-muted mt-1 text-sm">{opt.description}</p>
            </button>
          ))}
        </div>
        {error && <p className="text-muted mt-4 text-sm">{error}</p>}
        <div className="mt-6">
          <Button
            onClick={handleLockIn}
            disabled={!selected || submitting}
            className="rounded-none px-6"
          >
            {submitting ? 'Locking in...' : 'Lock in →'}
          </Button>
        </div>
      </div>
    );
  }

  // pending / running / loading
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <p className="text-muted text-sm">Researching what people pay for...</p>
    </div>
  );
}
