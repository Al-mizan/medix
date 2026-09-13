import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DoctorDashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Doctor Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/80 bg-surface shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="size-8 rounded-lg" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Consultations Queue Skeleton */}
      <Card className="border-border/80 bg-surface shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/15 gap-4"
            >
              <div className="flex items-center gap-3.5">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded-md" />
                  <Skeleton className="h-3 w-48 rounded-md" />
                  <Skeleton className="h-3 w-28 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
