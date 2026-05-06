export default function ResourceViewLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-border/70 bg-crimson pb-8 pt-24 text-white sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 h-4 w-36 animate-pulse rounded bg-white/25" />
          <div className="h-9 max-w-xl animate-pulse rounded-lg bg-white/20 sm:h-10" />
          <div className="mt-4 h-4 w-56 animate-pulse rounded bg-white/15" />
          <div className="mt-5 space-y-2">
            <div className="h-3 max-w-2xl animate-pulse rounded bg-white/15" />
            <div className="h-3 max-w-xl animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border/70 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-2 opacity-80">
              <div className="h-9 w-24 animate-pulse rounded-lg bg-muted/70" />
              <div className="h-9 w-40 animate-pulse rounded-lg bg-muted/55" />
              <div className="h-9 w-24 animate-pulse rounded-lg bg-muted/70" />
            </div>
            <div className="h-[72vh] min-h-[280px] animate-pulse rounded-lg bg-gradient-to-b from-muted/35 via-muted/20 to-muted/40 ring-1 ring-border/40" />
            <p className="text-center text-xs text-muted-foreground">Loading resource…</p>
          </div>
        </div>
      </div>
    </div>
  );
}
