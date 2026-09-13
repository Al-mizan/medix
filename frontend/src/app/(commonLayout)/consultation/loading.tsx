import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ConsultationLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header and Search Filter Bar Skeleton */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <Skeleton className="h-9 w-72 mx-auto rounded-lg" />
        <Skeleton className="h-4 w-96 mx-auto rounded-md" />
        <div className="flex gap-2 max-w-md mx-auto pt-2">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      </div>

      {/* Specialty Filter Chips Skeleton */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-full" />
        ))}
      </div>

      {/* Doctor Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border/80 bg-surface shadow-xs overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="size-16 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-36 rounded-md" />
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                  <Skeleton className="h-3.5 w-44 rounded-md" />
                </div>
              </div>
              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
