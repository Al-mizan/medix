import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PatientDashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner Skeleton */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* 4 Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/80 bg-surface shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="size-8 rounded-lg" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 cols: Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/80 bg-surface shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-44 rounded-md" />
                <Skeleton className="h-3.5 w-60 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20 gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <Skeleton className="size-12 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36 rounded-md" />
                      <Skeleton className="h-3 w-28 rounded-md" />
                      <Skeleton className="h-3 w-40 rounded-md" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 col: Recent Prescriptions & Profile Overview */}
        <div className="space-y-6">
          <Card className="border-border/80 bg-surface shadow-xs">
            <CardHeader>
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-3.5 w-48 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-border/60 bg-muted/10 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-44 rounded-md" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
