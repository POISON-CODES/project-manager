export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center space-y-4">
      <h1 className="text-4xl font-bold tracking-tight text-primary">
        NexusFlow Automation Engine
      </h1>
      <p className="text-lg text-muted-foreground max-w-lg">
        Enterprise-grade project management with automated escalation and visual halting.
      </p>
      <div className="flex gap-4 mt-8">
        <a
          href="/dashboard"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    </main>
  );
}
