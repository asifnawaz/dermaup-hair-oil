export default function CheckoutLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-muted" />
          <div className="h-8 w-32 rounded bg-muted" />
        </div>
        <div className="mb-8 flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-primary/20" />
          <div className="h-1 flex-1 rounded bg-muted" />
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="h-1 flex-1 rounded bg-muted" />
          <div className="h-8 w-8 rounded-full bg-muted" />
        </div>
        <div className="space-y-4 rounded-2xl border bg-white p-6">
          <div className="h-6 w-36 rounded bg-muted" />
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
            </div>
            <div className="h-5 w-20 rounded bg-muted" />
          </div>
          <div className="mt-4 h-12 rounded-xl bg-primary/20" />
        </div>
      </div>
    </div>
  );
}
