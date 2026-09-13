export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Top Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-52 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-80 rounded-md bg-muted/60 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 rounded-xl bg-muted animate-pulse" />
          <div className="h-9 w-32 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>

      {/* Admin Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/70 bg-surface p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 rounded bg-muted/70 animate-pulse" />
              <div className="size-8 rounded-lg bg-muted animate-pulse" />
            </div>
            <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-36 rounded bg-muted/50 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-border/70 bg-surface p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="h-5 w-48 rounded bg-muted animate-pulse" />
          <div className="h-9 w-64 rounded-lg bg-muted/50 animate-pulse" />
        </div>
        <div className="space-y-2.5 pt-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
