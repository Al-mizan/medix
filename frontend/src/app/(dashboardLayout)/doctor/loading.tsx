export default function DoctorDashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Top greeting skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-72 rounded-md bg-muted/60 animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-muted/80 animate-pulse" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/70 bg-surface p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-muted/70 animate-pulse" />
              <div className="size-8 rounded-lg bg-muted animate-pulse" />
            </div>
            <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-32 rounded bg-muted/50 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main clinical queue skeleton */}
      <div className="rounded-2xl border border-border/70 bg-surface p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="h-5 w-44 rounded bg-muted animate-pulse" />
          <div className="h-8 w-24 rounded-lg bg-muted/60 animate-pulse" />
        </div>
        <div className="space-y-3 pt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 w-full rounded-xl bg-muted/40 animate-pulse flex items-center px-4 justify-between" />
          ))}
        </div>
      </div>
    </div>
  );
}
