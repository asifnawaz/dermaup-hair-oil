export default function ProductsLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-background">
      <section className="border-y border-slate-200 bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto mb-4 h-10 w-80 rounded-lg bg-white/10" />
          <div className="mx-auto h-6 w-96 max-w-full rounded-lg bg-white/10" />
        </div>
      </section>
      <section className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3">
            <div className="h-9 w-28 rounded-full bg-muted" />
            <div className="h-9 w-24 rounded-full bg-muted" />
            <div className="h-9 w-24 rounded-full bg-muted" />
          </div>
        </div>
      </section>
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-6 h-4 w-24 rounded bg-muted" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border/60 bg-white"
              >
                <div className="aspect-[4/3] bg-muted" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-24 rounded bg-muted" />
                    <div className="h-4 w-12 rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
