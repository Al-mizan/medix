export default function AuthLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/80 bg-surface/80 p-6 sm:p-8 shadow-md">
        {/* Header skeleton */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="size-12 rounded-2xl bg-muted animate-pulse" />
          <div className="h-6 w-44 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-60 rounded-md bg-muted/60 animate-pulse" />
        </div>

        {/* Input fields skeleton */}
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="h-3.5 w-16 rounded bg-muted animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-muted/60 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-20 rounded bg-muted animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-muted/60 animate-pulse" />
          </div>
          <div className="h-10 w-full rounded-lg bg-primary/30 animate-pulse mt-2" />
        </div>

        {/* Footer links skeleton */}
        <div className="pt-2 flex justify-center">
          <div className="h-3.5 w-40 rounded bg-muted/60 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
