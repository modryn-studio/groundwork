import type { Metadata } from 'next';
import RunContent from './run-content';

export const metadata: Metadata = {
  title: 'Pipeline running — Groundwork',
  description: 'Your market research pipeline is running.',
  robots: { index: false },
};

export default async function RunPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  return <RunContent threadId={threadId} />;
}
