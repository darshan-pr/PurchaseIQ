export default function DatasetMetadataLoading() {
  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-3">
          <div className="h-8 w-56 animate-pulse rounded-xl bg-neutral-200" />
          <div className="h-4 w-72 animate-pulse rounded-lg bg-neutral-200" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-neutral-200" />
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="h-5 w-36 animate-pulse rounded-lg bg-neutral-200" />
        <div className="mt-5 space-y-3">
          {[1, 2, 3].map((row) => (
            <div key={row} className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
