export default function ProductDetailLoading() {
  return (
    <main className="animate-pulse bg-white">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="aspect-[4/5] rounded-2xl bg-stone-200" />
            <div className="mt-3 grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }, (_, index) => (
                <div className="aspect-square rounded-lg bg-stone-100" key={index} />
              ))}
            </div>
          </div>
          <div className="space-y-4 lg:pt-8">
            <div className="h-4 w-32 rounded bg-stone-200" />
            <div className="h-12 w-4/5 rounded bg-stone-200" />
            <div className="h-5 w-full rounded bg-stone-100" />
            <div className="h-5 w-5/6 rounded bg-stone-100" />
            <div className="mt-8 h-14 w-full rounded-full bg-stone-200" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div className="h-20 rounded-xl bg-stone-100" key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
      {Array.from({ length: 4 }, (_, index) => (
        <section className="border-t border-stone-200 px-4 py-16" key={index}>
          <div className="mx-auto h-64 max-w-6xl rounded-2xl bg-stone-100" />
        </section>
      ))}
    </main>
  );
}
