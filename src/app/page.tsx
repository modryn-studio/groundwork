import EmailSignup from '@/components/email-signup';

export default function Home() {
  return (
    <main className="bg-bg min-h-screen px-4 sm:px-6">
      <div className="mx-auto max-w-2xl pt-24 pb-16">
        <h1 className="font-heading text-text text-4xl font-bold sm:text-5xl">
          Drop an idea.
          <br />
          <span className="text-accent">Get the docs.</span>
        </h1>
        <p className="text-muted mt-6 text-[15px] sm:text-base">
          You name the market. Agents find what&apos;s already selling. You decide the angle. You
          get <code className="text-text font-mono">context.md</code> and{' '}
          <code className="text-text font-mono">brand.md</code>, ready to build from.
        </p>
      </div>

      <EmailSignup />
    </main>
  );
}
