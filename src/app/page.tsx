import EmailSignup from '@/components/email-signup';

export default function Home() {
  return (
    <main className="min-h-screen bg-bg px-4 sm:px-6">
      <div className="mx-auto max-w-2xl pt-24 pb-16">
        <h1 className="font-heading text-4xl font-bold text-text sm:text-5xl">
          Drop an idea.
          <br />
          <span className="text-accent">Get the docs.</span>
        </h1>
        <p className="mt-6 text-[15px] text-muted sm:text-base">
          You name the market. Agents find what&apos;s already selling. You decide the angle. You get{' '}
          <code className="font-mono text-text">context.md</code> and{' '}
          <code className="font-mono text-text">brand.md</code>, ready to build from.
        </p>
      </div>

      <EmailSignup />
    </main>
  );
}
