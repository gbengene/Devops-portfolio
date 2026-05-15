export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 max-w-5xl animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-32 bg-gray-100 rounded" />
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card py-4">
            <div className="h-3 w-20 bg-gray-100 rounded mb-3" />
            <div className="h-8 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      {/* Content skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card space-y-3">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-12 bg-gray-50 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
