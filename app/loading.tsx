// This renders while the homepage Server Component is fetching data.
// Next.js shows this automatically as a suspense boundary fallback.
export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 aspect-[16/9] bg-paper-dark rounded-xl" />
        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-paper-dark rounded-xl" />
          <div className="flex-1 bg-paper-dark rounded-xl" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <div className="aspect-[16/10] bg-paper-dark" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-paper-dark rounded w-16" />
              <div className="h-4 bg-paper-dark rounded w-full" />
              <div className="h-4 bg-paper-dark rounded w-3/4" />
              <div className="h-3 bg-paper-dark rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
